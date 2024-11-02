document.addEventListener('DOMContentLoaded', async () => {
    try {
        await verifyToken();
        const token = localStorage.getItem('token');
        
        // Fetch dashboard summary
        const response = await fetch('http://studelist-app-api.vercel.app/api/dashboard/summary', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard data');
        }

        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message);
        }

        // Update counts
        document.getElementById('notesCount').textContent = data.summary.notes.count;
        document.getElementById('todoCount').textContent = data.summary.todos.count;
        document.getElementById('eventsCount').textContent = data.summary.events.count;

        // Update notes list
        const notesList = document.getElementById('notesList');
        notesList.innerHTML = '';
        data.summary.notes.recent.forEach(note => {
            const li = document.createElement('li');
            li.textContent = note.title || note.content.substring(0, 50) + '...';
            notesList.appendChild(li);
        });

        // Update todos list (now using status)
        const todoList = document.getElementById('todoList');
        todoList.innerHTML = '';
        data.summary.todos.recent.forEach(todo => {
            const li = document.createElement('li');
            li.textContent = todo.task;
            // Add appropriate class based on status
            li.classList.add(todo.status.replace('_', '-'));
            todoList.appendChild(li);
        });

        // Update events list
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';
        data.summary.events.upcoming.forEach(event => {
            const li = document.createElement('li');
            const date = new Date(event.date);
            const formattedDate = date.toLocaleDateString();
            li.textContent = `${event.title} - ${formattedDate}`;
            eventsList.appendChild(li);
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Show error message to user
        const dashboardContainer = document.querySelector('.dashboard-container');
        if (dashboardContainer) {
            dashboardContainer.innerHTML = `
                <div class="error-message">
                    <p>Error loading dashboard data. Please try again later.</p>
                </div>
            `;
        }
    }
});

// Token verification function remains unchanged
async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://studelist-app-api.vercel.app/api/auth/verify', {
            method: 'GET',
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
        window.location.href = 'login.html';
    }
}