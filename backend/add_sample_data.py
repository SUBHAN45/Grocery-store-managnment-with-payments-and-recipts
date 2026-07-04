import os
import sys

# Ensure the root directory is in the Python path to resolve backend imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.sql_connection import get_sql_connection
from backend.products_dao import insert_new_product

def add_sample_products():
    conn = get_sql_connection()
    
    products = [
        {'name': 'Rice', 'uom_id': 1, 'price_per_unit': 55.0},
        {'name': 'Pasta', 'uom_id': 1, 'price_per_unit': 30.0},
        {'name': 'Tomato', 'uom_id': 1, 'price_per_unit': 20.0},
        {'name': 'Toothpaste', 'uom_id': 2, 'price_per_unit': 45.0},
        {'name': 'Soap', 'uom_id': 2, 'price_per_unit': 25.0},
        {'name': 'Milk', 'uom_id': 3, 'price_per_unit': 35.0},
    ]

    print("Adding sample products...")
    for p in products:
        try:
            new_id = insert_new_product(conn, p)
            print(f"Added product: {p['name']} (ID: {new_id})")
        except Exception as e:
            print(f"Error adding {p['name']}: {e}")
            
    conn.close()
    print("Done.")

if __name__ == '__main__':
    add_sample_products()
