document.addEventListener('DOMContentLoaded', function () {
    // Other code...

    // Events
    const eventsSection = document.getElementById('events');
    const eventForm = document.getElementById('eventForm');
    const eventTitleInput = document.getElementById('eventTitle');
    const eventDescriptionInput = document.getElementById('eventDescription');
    const eventDateInput = document.getElementById('eventDate');
    const eventLocationInput = document.getElementById('eventLocation');
    const eventTimeInput = document.getElementById('eventTime');
    const eventList = eventsSection.querySelector('.event-list');

    eventForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const title = eventTitleInput.value.trim();
        const description = eventDescriptionInput.value.trim();
        const date = eventDateInput.value.trim();
        const location = eventLocationInput.value.trim();
        const time = eventTimeInput.value.trim();

        if (!title || !date || !time) {
            alert('Title, date, and time are required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/events', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description, date, location, time })
            });

            if (!response.ok) {
                throw new Error('Error creating event');
            }

            const data = await response.json();
            if (data.success) {
                eventForm.reset();
                fetchEvents();
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating event:', error);
        }
    });

    async function fetchEvents() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/events', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error fetching events');
            }

            const data = await response.json();
            if (data.success) {
                eventList.innerHTML = '';
                data.events.forEach(event => {
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item');
                    eventItem.innerHTML = `
                        <h3>${event.title}</h3>
                        <p>${event.description}</p>
                        <p>Date: ${event.date}</p>
                        <p>Location: ${event.location}</p>
                        <p>Time: ${event.time}</p>
                    `;
                    eventList.appendChild(eventItem);
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    fetchEvents();
});
