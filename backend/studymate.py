import os
import fitz # PyMuPDF
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from dotenv import load_dotenv

load_dotenv()

# Config (Ensure GEMINI_API_KEY is in backend/.env)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_ID = "gemini-2.5-flash"

def extract_text(pdf_path: str) -> str:
    pages = []
    with fitz.open(pdf_path) as doc:
        for page in doc:
            pages.append(page.get_text())
    return "\n".join(pages)

def build_vector_store(pdf_files: list):
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    texts = []
    for path in pdf_files:
        raw = extract_text(path)
        texts.extend(splitter.split_text(raw))
    
    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return FAISS.from_texts(texts, embedding=embeddings)