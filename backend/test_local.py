import asyncio
from main import process_rag
from fastapi import UploadFile
import io
import os

async def run_test():
    # create a dummy file
    dummy_pdf_content = b"%PDF-1.4 dummy pdf content for testing"
    with open("test.pdf", "wb") as f:
        f.write(dummy_pdf_content)

    try:
        with open("test.pdf", "rb") as f:
            upload_file = UploadFile(filename="test.pdf", file=f, headers={"content-type": "application/pdf"})
            print("Running process_rag...")
            res = await process_rag(student_name="Test Student", file=upload_file)
            print("Result:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(run_test())
