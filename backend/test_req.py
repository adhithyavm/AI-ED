import urllib.request
try:
    req = urllib.request.Request("http://localhost:8000/process-rag", data=b"", method="POST")
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.status)
        print("Body:", response.read().decode())
except Exception as e:
    print("Error:", e)
