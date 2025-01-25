export const loadTransactions = async () => {
    const response = await fetch('http://127.0.0.1:5000/expenses');
    const transactions = await response.json();
    return transactions;
};

export const saveTransaction = async (transaction) => {
    const response = await fetch('http://127.0.0.1:5000/expenses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    });
    return await response.json();
};

export const updateTransaction = async (id, transaction) => {
    await fetch(`http://127.0.0.1:5000/expenses/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transaction)
    });
};

export const deleteTransaction = async (id) => {
    await fetch(`http://127.0.0.1:5000/expenses/${id}`, {
        method: 'DELETE'
    });
};