import pandas as pd
from typing import Optional
from fastapi import APIRouter
import os
from datetime import datetime
from pydantic import BaseModel

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

router = APIRouter()

ques_file = os.path.join(BASE_DIR,"..", "..", "model", "questions.csv")

history_file = os.path.join(BASE_DIR,".." ,"..", "model", "history.csv")

class HistoryRecord(BaseModel):
    email: str
    ques_id: int
    


# def get_unattempted_ques(email: str) -> dict:


#     if not os.path.exists(ques_file):
#         return {"status": "error", "message": "Questions file not found"}
    

#     df_ques = pd.read_csv(ques_file)
#     df_ques['id'] = df_ques['id'].astype(str)

    
            
    
    
#     next_ques = available_ques.sample(n=1).iloc[0].to_dict()

#     return {
#         "status": "success",
#         "question": next_ques
#     }


@router.post("/api/save-attempt")
async def save_attempt(data: HistoryRecord):

    try:

        new_record = pd.DataFrame([{

            "user_email": data.email,
            "ques_id": data.ques_id,
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        }])

        file_exists = os.path.isfile(history_file)

        os.makedirs(os.path.dirname(history_file), exist_ok=True)

        new_record.to_csv(
            history_file, 
            mode='a', 
            header=not file_exists, 
            index=False,
            encoding='utf-8'
        )
        return {"status": "success", "message": "Attempt saved successfully"}
    except Exception as e:
        return {"error", f"Failed to save history: {str(e)}"}

def calculate_next_level(cur_level: int, was_cor: bool) -> int:
    if was_cor:
        return cur_level + 1
    else:
        return 1

def get_ques():
    try:
        df = pd.read_csv(ques_file)

        if df.empty:
            return None
        
        random_row = df.sample(n=1).iloc[0].to_dict()
        random_row['id'] = int(random_row['id'])

        return random_row
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return None
    
# @router.get("/api/next-ques")

# def get_next_ques(email: str):

#     result = get_unattempted_ques(email)

#     return result


    
@router.get("/api/ques")
async def random_ques(
    email: str,
    cur_diff: Optional[int] = 1,
    was_cor: Optional[str] = None
):
    try:
        df_ques = pd.read_csv(ques_file)
        if df_ques.empty:
            return {"error": "CSV file is empty"}
        
        attempted_ids = set()

        if os.path.exists(history_file):

            try:
                df_history = pd.read_csv(history_file)
                df_history['ques_id'] = df_history['ques_id'].astype(str)

                user_history = df_history[df_history['user_email'] == email]['ques_id']
                attempted_ids = set(user_history.astype(int))

                # return set(user_history)
            except Exception as e:
                print(f"Error reading history CSV: {e}")

        available_ques = df_ques[~df_ques['id'].isin(attempted_ids)]

        if available_ques.empty:
            return {"status": "complete", "message": "Congratulations! You've attempted all questions."}

        target_level = cur_diff

        if was_cor is not None:
            is_cor_bool = was_cor.lower() == "true"
            target_level = calculate_next_level(cur_diff, is_cor_bool)

        if target_level > 5:
            return {"status": "complete", "message": "Congratulations! You've mastered all difficulty levels."} 

        filtered_df = available_ques[available_ques['diff'] == target_level]

        if filtered_df.empty:
            filtered_df = available_ques

        random_row = filtered_df.sample(n=1).iloc[0].to_dict()
        random_row['id'] = int(random_row['id'])
        random_row['diff'] = int(random_row['diff'])

        return random_row

    except Exception as e:
        return {"error": f"Internal server error: {str(e)}"}