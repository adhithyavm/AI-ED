import os
from dotenv import dotenv_values

res = dotenv_values(".env")
print("ENV variables found in .env:")
for k in res:
    print(k, "=", repr(res[k][:5] + "..." if res[k] and len(res[k]) > 5 else res[k]))
