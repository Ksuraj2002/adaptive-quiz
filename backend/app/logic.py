import csv
import pandas as pd
from datetime import datetime
import os

file = "../model/user.csv"
history_file = "../model/history.csv"

print("Script started")



def get_users(filename):

    users = []

    try:
        with open(filename, mode = 'r', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                users.append(row)
        return users
    except FileNotFoundError:
        return []
    
users = get_users(file)

# print(users)
    
def authenticate(email,password):
    found_user = next(
        (user for user in users if user['email'] == email),
        None
    )

    if not found_user:
        return {"status": "not_found"}

    
    if found_user['password'] != password:
        return {"status": "invalid_password"}

    
    return {"status": "success", "user": found_user}

    
