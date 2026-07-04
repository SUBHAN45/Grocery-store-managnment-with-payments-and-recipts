import sqlite3
import os

def get_sql_connection():
    # Use absolute path to ensure DB is found/created in the right place
    # db_path = 'grocery_store.db'
    # For this environment, let's keep it in the root of the workspace
    db_path = r'C:\Users\jafre\OneDrive\Desktop\Python pro\code\grocery_store.db'
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row # Access columns by name
    return conn
