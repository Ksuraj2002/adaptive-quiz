from fastapi import FastAPI,HTTPException
from fastapi.middleware.cors import CORSMiddleware
from logic import authenticate
from pydantic import BaseModel
from routes import ques
import uvicorn


import csv

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    )

app.include_router(ques.router)


class ProfileRequest(BaseModel):
    email: str
    password: str

# @app.post("/api/user-profile")
# def user_profile(data: dict):  # 👈 Temporarily change from ProfileRequest to dict
#     print("\n🚨🚨🚨 RAW RECEIVED DATA:", data, "\n")
    
#     # Extract keys safely
#     email = data.get("email")
#     password = data.get("password")
    
#     if not email or not password:
#         raise HTTPException(status_code=422, detail=f"Missing keys. Received: {list(data.keys())}")
        
#     result = authenticate(email, password)

#     if result["status"] == "not_found":
#         raise HTTPException(status_code=404, detail="User not found")
#     if result["status"] == "invalid_password":
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     return {
#         "status": "success",
#         "user": result["user"]
#     }


@app.post("/api/user-profile")

def user_profile(data: ProfileRequest):
    result = authenticate(data.email,data.password)

    # print(result)

    if result["status"] == "not_found":
        raise HTTPException(status_code=404, detail="User not found")

    if result["status"] == "invalid_password":
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "status": "success",
        "user": result["user"]
    }

    

# def get_users():
#     users = []
#     with open("../model/user.csv", mode="r", encoding="utf-8") as file:
#         reader = csv.DictReader(file)
#         for row in reader:
#             users.append(row)
#     return users



# def users():
#     return get_users()

if __name__ == "__main__":
    uvicorn.run(
        app,          
        host="127.0.0.1",
        port=8000
    )