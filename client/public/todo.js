document.addEventListener('DOMContentLoaded', function () {
    // Other code...

    // To-Do List
    const todoSection = document.getElementById('todo');
    const todoForm = todoSection.querySelector('.todo-form');
    const todoTaskInput = document.getElementById('todoTask');
    const todoList = todoSection.querySelector('.todo-list');
    const completedList = todoSection.querySelector('.completed-list');

    todoForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const task = todoTaskInput.value.trim();

        if (!task) {
            alert('Task is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/todo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ task })
            });

            if (!response.ok) {
                throw new Error('Error creating task');
            }

            const data = await response.json();
            if (data.success) {
                todoForm.reset();
                fetchTodos();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating task:', error);
        }
    });

    async function fetchTodos() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/todo', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error fetching todos');
            }

            const data = await response.json();
            if (data.success) {
                todoList.innerHTML = '';
                completedList.innerHTML = '';
                data.todos.forEach(todo => {
                    const todoItem = document.createElement('li');
                    todoItem.classList.add('todo-item');
                    todoItem.innerHTML = `
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
                        <span>${todo.task}</span>
                    `;
                    if (todo.completed) {
                        completedList.appendChild(todoItem);
                    } else {
                        todoList.appendChild(todoItem);
                    }
                });

                const checkboxes = todoSection.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('change', updateTodoCompletion);
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    }

    async function updateTodoCompletion(e) {
        const id = e.target.getAttribute('data-id');
        const completed = e.target.checked;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/todo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ completed })
            });

            if (!response.ok) {
                throw new Error('Error updating task');
            }

            const data = await response.json();
            if (data.success) {
                fetchTodos();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating task:', error);
        }
    }

    fetchTodos();
});