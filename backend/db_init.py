import sqlite3
import os

def init_db():
    # Use absolute path to ensure DB is found in the right place
    db_path = r'c:\Users\Acer\OneDrive\Desktop\grocery store management webaap\grocery_store.db'
    
    # If the file exists, we'll connect; if not, sqlite3 will create it
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print(f"Creating tables in {db_path}...")
    
    # 1. Create Unit of Measure (UOM) table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS uom (
        uom_id INTEGER PRIMARY KEY AUTOINCREMENT,
        uom_name TEXT NOT NULL UNIQUE
    )
    ''')
    
    # 2. Create Products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        product_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        uom_id INTEGER NOT NULL,
        price_per_unit REAL NOT NULL,
        FOREIGN KEY (uom_id) REFERENCES uom (uom_id)
    )
    ''')
    
    # 3. Create Orders table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS orders (
        order_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        total REAL NOT NULL,
        datetime TEXT NOT NULL
    )
    ''')
    
    # 4. Create Order Details table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS order_details (
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity REAL NOT NULL,
        total_price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (product_id) REFERENCES products (product_id)
    )
    ''')
    
    # Insert default UOMs
    uoms = [('kg',), ('unit',), ('liter',)]
    print("Inserting default UOMs...")
    for uom in uoms:
        try:
            cursor.execute("INSERT OR IGNORE INTO uom (uom_name) VALUES (?)", uom)
        except sqlite3.Error as e:
            print(f"Error inserting UOM {uom}: {e}")
            
    conn.commit()
    conn.close()
    print("Database initialization complete.")

if __name__ == '__main__':
    init_db()
