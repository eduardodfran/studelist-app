async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/index.html';
        return;
    }

    try {
        const response = await fetch('http://studelist-app-api.vercel.app/api/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        window.location.href = '/index.html';
    }
}

document.addEventListener('DOMContentLoaded', async function () {
  // Verify token first
  await verifyToken()

  const todoForm = document.querySelector('.todo-form')
  const todoTaskInput = document.getElementById('todoTask')
  const notStartedList = document.querySelector('.not-started-list')
  const inProgressList = document.querySelector('.in-progress-list')
  const completedList = document.querySelector('.completed-list')

  // Initial fetch
  fetchTodos()

  // Initialize Sortable for all lists
  const lists = [notStartedList, inProgressList, completedList]
  lists.forEach(list => {
    new Sortable(list, {
        group: 'shared',
        animation: 150,
        ghostClass: 'sortable-ghost',
        dragClass: 'sortable-drag',
        onEnd: function (evt) {
            if (evt.to !== evt.from) {  // Only update if the list changed
                const itemId = evt.item.dataset.id;
                const newStatus = getStatusFromList(evt.to);
                console.log('Moving item:', { itemId, newStatus }); // Debug log
                updateTodoStatus(itemId, newStatus);
            }
        },
    });
});

  // Helper function to get status from list
  function getStatusFromList(list) {
    if (list.classList.contains('not-started-list')) return 'not_started';
    if (list.classList.contains('in-progress-list')) return 'in_progress';
    if (list.classList.contains('completed-list')) return 'completed';
    return 'not_started';
}

  // Form submit handler
  todoForm.addEventListener('submit', async function (e) {
      e.preventDefault()
      const task = todoTaskInput.value.trim()

      if (!task) {
          showToast('Task is required', 'error')
          return
      }

      try {
          const token = localStorage.getItem('token')
          const response = await fetch('http://studelist-app-api.vercel.app/api/todo', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ task }),
          })

          if (!response.ok) {
              throw new Error('Error creating task')
          }

          const data = await response.json()
          if (data.success) {
              todoForm.reset()
              fetchTodos()
              showToast('Task created successfully', 'success')
          } else {
              showToast(data.message, 'error')
          }
      } catch (error) {
          console.error('Error creating task:', error)
          showToast('Failed to create task', 'error')
      }
  })

  // Fetch todos function
  async function fetchTodos() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/index.html';
            return;
        }

        const response = await fetch('http://studelist-app-api.vercel.app/api/todo', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token');
            window.location.href = '/index.html';
            return;
        }

        const data = await response.json();
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch todos');
        }

        // Clear existing lists
        const notStartedList = document.querySelector('.not-started-list');
        const inProgressList = document.querySelector('.in-progress-list');
        const completedList = document.querySelector('.completed-list');
        
        notStartedList.innerHTML = '';
        inProgressList.innerHTML = '';
        completedList.innerHTML = '';

        // Sort todos into appropriate lists
        const todos = data.todos || [];
        const notStartedTodos = todos.filter(todo => todo.status === 'not_started');
        const inProgressTodos = todos.filter(todo => todo.status === 'in_progress');
        const completedTodos = todos.filter(todo => todo.status === 'completed');

        // Add empty state if no todos
        if (todos.length === 0) {
            notStartedList.appendChild(createEmptyState());
        } else {
            // Populate lists
            notStartedTodos.forEach(todo => {
                notStartedList.appendChild(createTodoItem(todo));
            });
            
            inProgressTodos.forEach(todo => {
                inProgressList.appendChild(createTodoItem(todo));
            });
            
            completedTodos.forEach(todo => {
                completedList.appendChild(createTodoItem(todo));
            });
        }
    } catch (error) {
        console.error('Error fetching todos:', error);
        showToast('Failed to fetch tasks', 'error');
    }
}

  // Create todo item element
  function createTodoItem(todo) {
      const todoItem = document.createElement('li')
      todoItem.classList.add('todo-item')
      todoItem.dataset.id = todo.id

      const dragHandle = document.createElement('div')
      dragHandle.classList.add('drag-handle')
      dragHandle.innerHTML = '⋮⋮'

      const taskText = document.createElement('span')
      taskText.textContent = todo.task

      const deleteBtn = document.createElement('button')
      deleteBtn.innerHTML = '×'
      deleteBtn.classList.add('delete-todo')
      deleteBtn.title = 'Delete task'
      deleteBtn.addEventListener('click', () => deleteTodo(todo.id))

      todoItem.appendChild(dragHandle)
      todoItem.appendChild(taskText)
      todoItem.appendChild(deleteBtn)

      return todoItem
  }

  // Create empty state element
  function createEmptyState() {
      const emptyDiv = document.createElement('div')
      emptyDiv.classList.add('empty-state')
      emptyDiv.innerHTML = `
          <p>No tasks yet</p>
          <small>Drag and drop tasks between lists</small>
      `
      return emptyDiv
  }

  // Update todo status
  async function updateTodoStatus(id, status) {
    try {
        const token = localStorage.getItem('token');
        console.log('Sending update request:', { id, status }); // Debug log

        const response = await fetch(`http://studelist-app-api.vercel.app/api/todo/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status }),
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Error updating task');
        }

        if (data.success) {
            await fetchTodos(); // Refresh the lists
            showToast('Task updated successfully', 'success');
        } else {
            showToast(data.message || 'Failed to update task', 'error');
        }
    } catch (error) {
        console.error('Error updating task:', error);
        showToast('Failed to update task', 'error');
        // Refresh the lists to revert the UI to the correct state
        await fetchTodos();
    }
}

  // Delete todo
  async function deleteTodo(id) {
      if (confirm('Are you sure you want to delete this task?')) {
          try {
              const token = localStorage.getItem('token')
              const response = await fetch(`http://studelist-app-api.vercel.app/api/todo/${id}`, {
                  method: 'DELETE',
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              })

              if (!response.ok) {
                  throw new Error('Error deleting task')
              }

              const data = await response.json()
              if (data.success) {
                  fetchTodos()
                  showToast('Task deleted successfully', 'success')
              } else {
                  showToast(data.message, 'error')
              }
          } catch (error) {
              console.error('Error deleting task:', error)
              showToast('Failed to delete task', 'error')
          }
      }
  }

  // Toast notification function
  function showToast(message, type = 'info') {
      const toast = document.createElement('div')
      toast.className = `toast ${type}`
      toast.textContent = message

      // Create toast container if it doesn't exist
      let toastContainer = document.getElementById('toast-container')
      if (!toastContainer) {
          toastContainer = document.createElement('div')
          toastContainer.id = 'toast-container'
          document.body.appendChild(toastContainer)
      }

      toastContainer.appendChild(toast)
      setTimeout(() => {
          toast.classList.add('fade-out')
          setTimeout(() => toast.remove(), 300)
      }, 3000)
  }

  // Add toast container styles if not already in CSS
  const style = document.createElement('style')
  style.textContent = `
      #toast-container {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
      }
      .toast {
          padding: 12px 24px;
          margin: 8px;
          border-radius: 4px;
          color: white;
          font-size: 14px;
          opacity: 1;
          transition: opacity 0.3s ease;
      }
      .toast.success { background-color: var(--success-color); }
      .toast.error { background-color: var(--danger-color); }
      .toast.info { background-color: var(--info-color); }
      .toast.fade-out { opacity: 0; }
  `
  document.head.appendChild(style)
})