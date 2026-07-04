def get_uoms(connection):
    cursor = connection.cursor()
    query = ("SELECT * FROM uom")
    cursor.execute(query)
    response = []
    for (uom_id, uom_name) in cursor:
        response.append({
            'uom_id': uom_id,
            'uom_name': uom_name
        })
    return response

def insert_uom(connection, uom_name):
    # Check if exists first to avoid duplicates
    cursor = connection.cursor()
    check_query = "SELECT * FROM uom WHERE uom_name = ?"
    cursor.execute(check_query, (uom_name,))
    if cursor.fetchone():
        return -1 # Already exists
        
    query = ("INSERT INTO uom (uom_name) VALUES (?)")
    cursor.execute(query, (uom_name,))
    connection.commit()
    return cursor.lastrowid
