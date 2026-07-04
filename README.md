# Grocery Store Management System

A Python-based Grocery Store Management System designed to streamline inventory management, product tracking, and order processing. This project provides an efficient solution for managing grocery store operations using a structured backend and a user-friendly interface.

## 📌 Features

* Product Management

  * Add new products
  * Update existing products
  * Delete products
  * View product catalog

* Inventory Management

  * Track available stock
  * Monitor inventory levels
  * Manage product units

* Order Management

  * Create customer orders
  * Store order details
  * Track purchased items

* Database Integration

  * SQLite database support
  * Persistent data storage
  * Organized data access using DAO (Data Access Object) pattern

## 🛠️ Tech Stack

* Python
* SQLite
* HTML
* CSS
* JavaScript

## 📂 Project Structure

```text
├── app1.py
├── grocery_store.db
├── backend
│   ├── db_init.py
│   ├── sql_connection.py
│   ├── products_dao.py
│   ├── orders_dao.py
│   └── uom_dao.py
├── templates
│   ├── index.html
│   ├── dashboard.html
│   ├── inventory.html
│   ├── manage-product.html
│   └── order.html
├── static
│   ├── css
│   ├── js
│   └── images
└── requirements.txt
```

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/grocery-store-management-system.git
cd grocery-store-management-system
```

### 2. Create a Virtual Environment

```bash
python -m venv venv
```

Activate the environment:

**Windows**

```bash
venv\Scripts\activate
```

**Linux/macOS**

```bash
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Initialize Database

```bash
python backend/db_init.py
```

### 5. Run the Application

```bash
python app1.py
```

## 🎯 Learning Outcomes

This project demonstrates:

* Python application development
* Database management with SQLite
* CRUD operations
* Data Access Object (DAO) architecture
* Inventory and order management concepts
* Frontend and backend integration

## 📸 Screenshots

Add screenshots of:

* Dashboard
* Product Management
* Inventory Management
* Order Management

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit pull requests for improvements.

## 📄 License

This project is created for educational and learning purposes.

## 👨‍💻 Author

**Subhan Shaik**

If you found this project useful, consider giving it a ⭐ on GitHub.
