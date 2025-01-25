import { loadTransactions, saveTransaction, updateTransaction, deleteTransaction } from './storage.js';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const transactionList = document.getElementById('transaction-list');
    const totalExpense = document.querySelector('h2');
    const themeToggle = document.getElementById('theme-toggle');
    const addCategoryButton = document.getElementById('add-category');
    const categorySelect = document.getElementById('category');
    let transactions = [];
    let total = 0;

    // Load transactions from the backend
    const loadAndDisplayTransactions = async () => {
        transactions = await loadTransactions();
        transactions.forEach(transaction => {
            addTransactionToDOM(transaction);
            total += transaction[1];
        });
        totalExpense.textContent = `Total Expense: $${total.toFixed(2)}`;
    };

    // Add transaction to DOM
    const addTransactionToDOM = (transaction) => {
        const listItem = document.createElement('li');
        listItem.className = 'bg-white dark:bg-gray-700 dark:text-gray-300 p-4 rounded-md shadow-sm';
        listItem.innerHTML = `
            <div>
                <h5 class="font-bold">${transaction[3]}</h5>
                <p class="text-sm text-gray-600 dark:text-gray-400">${transaction[4]}</p>
                <p class="text-sm">Date: ${transaction[2]}</p>
                <p class="text-sm">Amount: ${transaction[5]} ${transaction[1].toFixed(2)}</p>
                <button class="btn btn-warning btn-sm edit-btn" data-id="${transaction[0]}" aria-label="Edit ${transaction[3]}">Edit</button>
                <button class="btn btn-danger btn-sm delete-btn" data-id="${transaction[0]}" aria-label="Delete ${transaction[3]}">Delete</button>
            </div>
        `;
        transactionList.appendChild(listItem);

        // Add event listeners for edit and delete buttons
        listItem.querySelector('.edit-btn').addEventListener('click', () => editTransaction(transaction));
        listItem.querySelector('.delete-btn').addEventListener('click', () => deleteTransactionHandler(transaction[0]));
    };

    // Theme toggle functionality
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
    });

    // Add custom category
    addCategoryButton.addEventListener('click', () => {
        const newCategory = document.getElementById('new-category').value;
        const newCategoryIcon = document.getElementById('new-category-icon').value;

        if (newCategory && newCategoryIcon) {
            const option = document.createElement('option');
            option.value = newCategory;
            option.innerHTML = `${newCategory} <i class="${newCategoryIcon}"></i>`;
            categorySelect.appendChild(option);

            document.getElementById('new-category').value = '';
            document.getElementById('new-category-icon').value = '';
        } else {
            alert('Please enter both category name and icon class.');
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const item = document.getElementById('Item').value;
        const category = document.getElementById('category').value;
        const currency = 'USD'; // Assuming USD as the currency

        // Validation
        if (isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount greater than zero.');
            return;
        }

        if (!date || new Date(date) > new Date()) {
            alert('Please enter a valid date that is not in the future.');
            return;
        }

        if (!item) {
            alert('Please enter an item.');
            return;
        }

        if (category === 'Choose Category') {
            alert('Please choose a category.');
            return;
        }

        const transaction = { amount, date, item, category, currency };
        total += amount;
        totalExpense.textContent = `Total Expense: ${currency} ${total.toFixed(2)}`;

        // Save transaction to the backend
        const newTransaction = await saveTransaction(transaction);

        addTransactionToDOM([newTransaction.id, amount, date, item, category, currency]);

        form.reset();
    });

    // Edit transaction
    const editTransaction = (transaction) => {
        document.getElementById('amount').value = transaction[1];
        document.getElementById('date').value = transaction[2];
        document.getElementById('Item').value = transaction[3];
        document.getElementById('category').value = transaction[4];

        const submitHandler = async (event) => {
            event.preventDefault();

            const amount = parseFloat(document.getElementById('amount').value);
            const date = document.getElementById('date').value;
            const item = document.getElementById('Item').value;
            const category = document.getElementById('category').value;
            const currency = 'USD'; // Assuming USD as the currency

            // Validation
            if (isNaN(amount) || amount <= 0) {
                alert('Please enter a valid amount greater than zero.');
                return;
            }

            if (!date || new Date(date) > new Date()) {
                alert('Please enter a valid date that is not in the future.');
                return;
            }

            if (!item) {
                alert('Please enter an item.');
                return;
            }

            if (category === 'Choose Category') {
                alert('Please choose a category.');
                return;
            }

            const updatedTransaction = { amount, date, item, category, currency };

            // Update transaction in the backend
            await updateTransaction(transaction[0], updatedTransaction);

            // Update transaction in the DOM
            const listItem = document.querySelector(`.edit-btn[data-id="${transaction[0]}"]`).closest('li');
            listItem.querySelector('.font-bold').textContent = item;
            listItem.querySelector('.text-gray-600').textContent = category;
            listItem.querySelector('.text-sm:nth-child(3)').textContent = `Date: ${date}`;
            listItem.querySelector('.text-sm:nth-child(4)').textContent = `Amount: ${currency} ${amount.toFixed(2)}`;

            form.reset();
            form.removeEventListener('submit', submitHandler);
            form.addEventListener('submit', addTransaction);
        };

        form.removeEventListener('submit', addTransaction);
        form.addEventListener('submit', submitHandler);
    };

    // Delete transaction
    const deleteTransactionHandler = async (id) => {
        // Delete transaction from the backend
        await deleteTransaction(id);

        // Remove transaction from the DOM
        const listItem = document.querySelector(`.delete-btn[data-id="${id}"]`).closest('li');
        listItem.remove();

        // Update total expense
        const amount = parseFloat(listItem.querySelector('.text-sm:nth-child(4)').textContent.split(' ')[1]);
        total -= amount;
        totalExpense.textContent = `Total Expense: $${total.toFixed(2)}`;
    };

    // Load transactions when the page loads
    loadAndDisplayTransactions();
});