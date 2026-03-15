import asyncio
from main import process_rag
from fastapi import UploadFile
import json

async def run_test():
    try:
        from reportlab.pdfgen import canvas
        c = canvas.Canvas("test_valid.pdf")
        c.drawString(100, 750, "Welcome to Early Childhood Education!")
        c.save()
    except ImportError:
        pass

    try:
        with open("test_valid.pdf", "rb") as f:
            upload_file = UploadFile(filename="test_valid.pdf", file=f, headers={"content-type": "application/pdf"})
            res = await process_rag(student_name="Test Student", file=upload_file)
            print("Response:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()

asyncio.run(run_test())
