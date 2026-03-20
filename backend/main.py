from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import json
import logging
from studymate import create_vs, get_pdf_text, ACTIVE_MODEL, API_KEY
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from supabase import create_client, Client

# standard logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

SB_URL = os.getenv("SUPABASE_URL")
SB_KEY = os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SB_URL, SB_KEY)

app = FastAPI()

# enable dev CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# make sure uploads dir exists
if not os.path.exists("uploads"):
    os.makedirs("uploads")
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.post("/process-rag")
async def process_rag(student_name: str = Form(...), file: UploadFile = File(...)):
    try:
        # save local copy of file
        f_path = os.path.join("uploads", file.filename)
        with open(f_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # grab text for db storage
        full_text = get_pdf_text(f_path)

        # store kid info
        k_key = student_name.lower().replace(" ", "_").strip()
        supabase.table("kids").upsert(
            {"name_key": k_key, "full_name": student_name}
        ).execute()

        # link doc to kid
        payload = {
            "kid_name_key": k_key,
            "file_url": f"/uploads/{file.filename}",
            "file_type": file.content_type or "application/pdf",
            "raw_content": full_text
        }
        res = supabase.table("kid_documents").insert(payload).execute()
        doc_id = res.data[0]["id"]

        # get context for LLM
        store = create_vs([f_path])
        matches = store.similarity_search(student_name, k=4)
        c_text = "\n".join([m.page_content for m in matches])

        # gen synthesis
        llm_engine = ChatGoogleGenerativeAI(model=ACTIVE_MODEL, temperature=0.2, google_api_key=API_KEY)
        
        system_msg = "Expert Educational Assistant"
        task_desc = f"Synthesize insights for {student_name} based on: {c_text}"
        
        prompt = f"""
        {system_msg}
        Instructions: Use only provided context. Return a JSON object for teacher, parent, and admin reports.
        Categories:
        - High: Safety or major academic failures.
        - Medium: Recent negative patterns.
        - Low: General updates or good news.

        Output format:
        {{
          "teacher_summary": "detailed analysis",
          "parent_summary": "encouraging update with specific home activity",
          "admin_summary": "safety/logistics view",
          "priority": "low/medium/high"
        }}
        """
        
        raw_res = llm_engine.invoke(prompt)
        text_out = raw_res.content.replace("```json", "").replace("```", "").strip()
        
        try:
            parsed = json.loads(text_out)
        except:
            # fallback if LLM is weird
            text_out = text_out.replace("\n", " ")
            parsed = json.loads(text_out)

        # save insights
        insight_data = {
            "document_id": doc_id,
            "summary_teacher": parsed.get("teacher_summary", ""),
            "summary_parent": parsed.get("parent_summary", ""),
            "summary_admin": parsed.get("admin_summary", ""),
            "priority_level": parsed.get("priority", "low")
        }
        supabase.table("insights").insert(insight_data).execute()

        return parsed 

    except Exception as err:
        logger.error(f"Error in processing: {str(err)}")
        raise HTTPException(status_code=500, detail="Failed to process document")

class ChatRequest(BaseModel):
    student_name: str
    message: str

@app.post("/chat")
async def handle_chat(req: ChatRequest):
    try:
        s_name = req.student_name.strip()
        n_key = s_name.lower().replace(" ", "_")
        
        # find student
        user_data = supabase.table("kids").select("*").or_(f"name_key.eq.{n_key},full_name.ilike.{s_name}").execute()
        
        if not user_data.data:
            return {"reply": "Student not found in our records.", "blocked": True}

        info = user_data.data[0]
        actual_name = info["full_name"]
        actual_key = info["name_key"]

        # pull context
        docs = supabase.table("kid_documents").select("raw_content").eq("kid_name_key", actual_key).execute()
        combined_text = "\n\n".join([d["raw_content"] for d in docs.data if d.get("raw_content")])[:12000]

        if not combined_text:
            # backup check
            insights = supabase.table("insights").select("*").eq("document_id", actual_key).execute()
            if not insights.data:
                return {"reply": f"No data found for {actual_name}.", "blocked": False}
            
            i = insights.data[0]
            combined_text = f"Teacher: {i.get('summary_teacher')}\nParent: {i.get('summary_parent')}"

        # LLM response
        model = ChatGoogleGenerativeAI(model=ACTIVE_MODEL, temperature=0.1, google_api_key=API_KEY)
        
        chat_prompt = f"""
        Role: Education Assistant for {actual_name}
        Context: {combined_text}
        User Query: "{req.message}"
        
        Rules:
        1. Only use context for specific facts.
        2. Be warm but professional.
        3. If trying to access other data, start with [BLOCKED].
        4. If info is missing, say you don't have it on record yet.
        """
        
        bot_res = model.invoke(chat_prompt)
        text_reply = bot_res.content.strip()
        
        is_blocked = text_reply.startswith("[BLOCKED]")
        return {"reply": text_reply.replace("[BLOCKED]", "").strip(), "blocked": is_blocked}

    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat server error")

class TransReq(BaseModel):
    text: str
    target_lang: str

@app.post("/translate")
async def do_translation(req: TransReq):
    try:
        engine = ChatGoogleGenerativeAI(model=ACTIVE_MODEL, temperature=0, google_api_key=API_KEY)
        p = f"Translate the following text into {req.target_lang}. Keep tone and structure intact.\n\nTEXT:\n{req.text}"
        res = engine.invoke(p)
        return {"translated_text": res.content.strip()}
    except Exception:
        raise HTTPException(status_code=500, detail="Translation failed")

if __name__ == "__main__":
    import uvicorn
    # set host to 0.0.0.0 for easier hosting later
    uvicorn.run(app, host="0.0.0.0", port=8000)