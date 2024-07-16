document.addEventListener('DOMContentLoaded', () => {
  // Hide all sections except the dashboard
  const sectionsToHide = document.querySelectorAll('.tool:not(#dashboard)');
  sectionsToHide.forEach(section => {
      section.classList.add('hide');
      section.classList.remove('show');
  });
});


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // Fetch summarized notes data
    const notesResponse = await fetch('http://localhost:3000/api/notes/summary', { headers });
    const notesData = await notesResponse.json();

    // Fetch summarized todos data
    const todoResponse = await fetch('http://localhost:3000/api/todo/summary', { headers });
    const todoData = await todoResponse.json();

    // Fetch summarized events data
    const eventsResponse = await fetch('http://localhost:3000/api/events/summary', { headers });
    const eventsData = await eventsResponse.json();

    // Display summarized notes data
    const notesCountElement = document.getElementById('notesCount');
    notesCountElement.textContent = `${notesData.length}`;

    // Display summarized todos data
    const todoCountElement = document.getElementById('todoCount');
    todoCountElement.textContent = `${todoData.length}`;

    // Display summarized events data
    const eventsCountElement = document.getElementById('eventsCount');
    eventsCountElement.textContent = `${eventsData.length}`;

    // Optionally, you can display the list of notes, todos, and events if needed
    // For notes:
    const notesListElement = document.getElementById('notesList');
    notesData.forEach(note => {
      const li = document.createElement('li');
      li.textContent = note.title; // Adjust according to your data structure
      notesListElement.appendChild(li);
    });

    // For todos:
    const todoListElement = document.getElementById('todoList');
    todoData.forEach(todo => {
      const li = document.createElement('li');
      li.textContent = todo.task; // Adjust according to your data structure
      todoListElement.appendChild(li);
    });

    // For events:
    const eventsListElement = document.getElementById('eventsList');
    eventsData.forEach(event => {
      const li = document.createElement('li');
      li.textContent = event.title; // Adjust according to your data structure
      eventsListElement.appendChild(li);
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
});


document.addEventListener('DOMContentLoaded', function() {
  const links = document.querySelectorAll('.sidebar-menu a');
  const sections = document.querySelectorAll('.content section');

  links.forEach(link => {
      link.addEventListener('click', function(e) {
          e.preventDefault();

          // Remove active class from all links
          links.forEach(link => link.classList.remove('active'));

          // Add active class to the clicked link
          this.classList.add('active');

          // Hide all sections
          sections.forEach(section => section.classList.remove('show'));
          sections.forEach(section => section.classList.add('hide'));

          // Show the corresponding section
          const target = this.id.replace('Tool', '');
          document.getElementById(target).classList.add('show');
          document.getElementById(target).classList.remove('hide');
      });
  });
});

