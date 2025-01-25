from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app)

# Database setup
conn = sqlite3.connect('expenses.db', check_same_thread=False)
cur = conn.cursor()
cur.execute("""
    CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        date TEXT,
        item TEXT,
        category TEXT,
        currency TEXT
    );
""")
cur.execute("""
    CREATE TABLE IF NOT EXISTS recurring_expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL,
        start_date TEXT,
        item TEXT,
        category TEXT,
        frequency TEXT,
        currency TEXT
    );
""")
conn.commit()

@app.route('/expenses', methods=['GET'])
def get_expenses():
    cur.execute("SELECT * FROM expenses")
    expenses = cur.fetchall()
    return jsonify(expenses)

@app.route('/expenses', methods=['POST'])
def add_expense():
    data = request.json
    cur.execute("INSERT INTO expenses (amount, date, item, category, currency) VALUES (?, ?, ?, ?, ?)",
                (data['amount'], data['date'], data['item'], data['category'], data['currency']))
    conn.commit()
    return jsonify({'message': 'Expense added successfully'}), 201

@app.route('/expenses/<int:id>', methods=['PUT'])
def update_expense(id):
    data = request.json
    cur.execute("UPDATE expenses SET amount = ?, date = ?, item = ?, category = ?, currency = ? WHERE id = ?",
                (data['amount'], data['date'], data['item'], data['category'], data['currency'], id))
    conn.commit()
    return jsonify({'message': 'Expense updated successfully'})

@app.route('/expenses/<int:id>', methods=['DELETE'])
def delete_expense(id):
    cur.execute("DELETE FROM expenses WHERE id = ?", (id,))
    conn.commit()
    return jsonify({'message': 'Expense deleted successfully'})

@app.route('/recurring_expenses', methods=['GET'])
def get_recurring_expenses():
    cur.execute("SELECT * FROM recurring_expenses")
    recurring_expenses = cur.fetchall()
    return jsonify(recurring_expenses)

@app.route('/recurring_expenses', methods=['POST'])
def add_recurring_expense():
    data = request.json
    cur.execute("INSERT INTO recurring_expenses (amount, start_date, item, category, frequency, currency) VALUES (?, ?, ?, ?, ?, ?)",
                (data['amount'], data['start_date'], data['item'], data['category'], data['frequency'], data['currency']))
    conn.commit()
    return jsonify({'message': 'Recurring expense added successfully'}), 201

if __name__ == '__main__':
    app.run(debug=True)