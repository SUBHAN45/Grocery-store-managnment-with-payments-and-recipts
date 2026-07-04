import os
import sys

# Ensure the root directory is in the Python path to resolve backend imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request, render_template
import json

from backend.sql_connection import get_sql_connection
from backend import products_dao
from backend import orders_dao
from backend import uom_dao

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/manage-products')
def manage_products():
    return render_template('manage-product.html')

@app.route('/orders')
def orders():
    return render_template('order.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/getUOMs', methods=['GET'])
def get_uom():
    connection = get_sql_connection()
    response = uom_dao.get_uoms(connection)
    connection.close()
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/insertUOM', methods=['POST'])
def insert_uom():
    connection = get_sql_connection()
    request_payload = json.loads(request.form['data'])
    uom_name = request_payload['uom_name']
    uom_id = uom_dao.insert_uom(connection, uom_name)
    connection.close()
    response = jsonify({
        'uom_id': uom_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getProducts', methods=['GET'])
def get_products():
    connection = get_sql_connection()
    products = products_dao.get_all_products(connection)
    connection.close()
    response = jsonify(products)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/insertProduct', methods=['POST'])
def insert_product():
    connection = get_sql_connection()
    request_payload = json.loads(request.form['data'])
    product_id = products_dao.insert_new_product(connection, request_payload)
    connection.close()
    response = jsonify({
        'product_id': product_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/deleteProduct', methods=['POST'])
def delete_product():
    connection = get_sql_connection()
    product_id = request.form['product_id']
    return_id = products_dao.delete_product(connection, product_id)
    connection.close()
    response = jsonify({
        'product_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/editProduct', methods=['POST'])
def edit_product():
    connection = get_sql_connection()
    request_payload = json.loads(request.form['data'])
    product_id = request.form['product_id']
    return_id = products_dao.edit_product(connection, product_id, request_payload)
    connection.close()
    response = jsonify({
        'product_id': return_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getAllOrders', methods=['GET'])
def get_all_orders():
    connection = get_sql_connection()
    response = orders_dao.get_all_orders(connection)
    connection.close()
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/insertOrder', methods=['POST'])
def insert_order():
    connection = get_sql_connection()
    request_payload = json.loads(request.form['data'])
    order_id = orders_dao.insert_order(connection, request_payload)
    connection.close()
    response = jsonify({
        'order_id': order_id
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/getOrderDetails', methods=['GET'])
def get_order_details():
    connection = get_sql_connection()
    order_id = request.args.get('order_id')
    response = orders_dao.get_order_details(connection, order_id)
    connection.close()
    response = jsonify(response)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response
@app.route('/inventory')
def inventory():
    return render_template('inventory.html')

@app.route('/getInventory', methods=['GET'])
def get_inventory():
    connection = get_sql_connection()
    cursor = connection.cursor()
    cursor.execute("SELECT p.name, u.uom_name, p.quantity FROM products p JOIN uom u ON p.uom_id = u.uom_id")
    rows = cursor.fetchall()
    connection.close()
    inventory = [dict(row) for row in rows]
    response = jsonify(inventory)
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/updateStock', methods=['POST'])
def update_stock():
    connection = get_sql_connection()
    request_payload = json.loads(request.form['data'])
    product_name = request_payload['product_name']
    quantity = request_payload['quantity']
    connection.execute("UPDATE products SET quantity=? WHERE name=?", (quantity, product_name))
    connection.commit()
    connection.close()
    response = jsonify({'success': True})
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting flask server for grocery store management system")
    app.run(port=5000, debug=True)
