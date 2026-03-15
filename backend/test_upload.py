import requests
import io

url = "http://localhost:8000/process-rag"
files = {'file': ('dummy.pdf', io.BytesIO(b"%PDF-1.4 dummy content"), 'application/pdf')}
data = {'student_name': 'Test Student'}

try:
    response = requests.post(url, files=files, data=data)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", e)
