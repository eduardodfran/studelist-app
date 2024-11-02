document.addEventListener('DOMContentLoaded', async function () {
  let calendar
  const token = localStorage.getItem('token')
  if (!token) {
    window.location.href = '/login.html'
    return
  }

  // Category colors configuration
  const categoryColors = {
    study: '#50c878', // Emerald green
    exam: 'tomato', // Tomato
    assignment: 'teal', // Teal
    meeting: '#ffd700', // Gold
    other: '#222', // Dark gray
  }

  // DOM Elements
  const modal = document.getElementById('eventModal')
  const closeBtn = document.querySelector('.close')
  const eventForm = document.getElementById('eventForm')
  const eventTitleInput = document.getElementById('eventTitle')
  const eventCategorySelect = document.getElementById('eventCategory')
  const eventDescriptionInput = document.getElementById('eventDescription')
  const eventDateInput = document.getElementById('eventDate')
  const eventLocationInput = document.getElementById('eventLocation')
  const eventTimeInput = document.getElementById('eventTime')
  const eventReminderSelect = document.getElementById('eventReminder')
  const eventRecurrenceSelect = document.getElementById('eventRecurrence')
  const recurrenceCountInput = document.getElementById('recurrenceCount')
  const searchInput = document.getElementById('eventSearch')
  const categoryFilter = document.getElementById('categoryFilter')
  const exportBtn = document.getElementById('exportEvents')
  const importBtn = document.getElementById('importEventsBtn')
  const importInput = document.getElementById('importEvents')
  const deleteModal = document.getElementById('deleteModal')
  const deleteEventTitle = document.getElementById('deleteEventTitle')
  const confirmDeleteBtn = document.getElementById('confirmDelete')
  const cancelDeleteBtn = document.getElementById('cancelDelete')

  let selectedEvent = null

  // Set default date and time
  const now = new Date()
  eventDateInput.value = now.toISOString().split('T')[0]
  eventTimeInput.value = now.toTimeString().slice(0, 5)

  // Modal Event Listeners
  closeBtn.onclick = function () {
    modal.style.display = 'none'
    // Reset form state
    eventForm.reset()
    selectedEvent = null
    const deleteBtn = document.getElementById('deleteEventBtn')
    if (deleteBtn) deleteBtn.remove()
    const submitBtn = eventForm.querySelector('.submit-btn')
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Event'
}

  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none'
    }
  }

  // Initialize FullCalendar
  function initializeCalendar() {
    const calendarEl = document.getElementById('calendar')
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
        },
        timeZone: 'Asia/Manila', // Set to Manila timezone
        displayEventTime: true,
        height: 'auto',
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        select: handleDateSelect,
        eventClick: handleEventClick,
        eventDrop: handleEventDrop,
        eventResize: handleEventResize,
        eventDidMount: function (info) {
            const category = info.event.extendedProps.category || 'other'
            info.el.style.backgroundColor = categoryColors[category]

            tippy(info.el, {
                content: `${info.event.title}${
                    info.event.extendedProps.description
                        ? '<br>' + info.event.extendedProps.description
                        : ''
                }`,
                allowHTML: true,
                theme: 'light',
            })
        },
    })

    calendar.render()
    loadEvents()
}

  // Event Handlers
  function handleDateSelect(selectInfo) {
    // Reset form and remove delete button
    eventForm.reset()
    const deleteBtn = document.getElementById('deleteEventBtn')
    if (deleteBtn) deleteBtn.remove()
    
    // Reset submit button text
    const submitBtn = eventForm.querySelector('.submit-btn')
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Event'
    
    // Clear selected event
    selectedEvent = null
    
    // Set the selected date and current time
    const now = new Date()
    eventDateInput.value = selectInfo.startStr
    eventTimeInput.value = now.toTimeString().slice(0, 5)
    
    // Show modal
    modal.style.display = 'block'
}


  function handleEventClick(clickInfo) {
    selectedEvent = clickInfo.event

    // Populate the edit modal with event data
    eventTitleInput.value = selectedEvent.title
    eventDescriptionInput.value = selectedEvent.extendedProps.description || ''
    eventDateInput.value = selectedEvent.start.toISOString().split('T')[0]
    eventTimeInput.value = selectedEvent.start.toTimeString().slice(0, 5)
    eventLocationInput.value = selectedEvent.extendedProps.location || ''
    eventCategorySelect.value = selectedEvent.extendedProps.category || 'other'

    // Change the submit button text
    const submitBtn = eventForm.querySelector('.submit-btn')
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Event'

    // Add a delete button to the modal
    let deleteBtn = document.getElementById('deleteEventBtn')
    if (!deleteBtn) {
      deleteBtn = document.createElement('button')
      deleteBtn.id = 'deleteEventBtn'
      deleteBtn.className = 'btn-danger'
      deleteBtn.type = 'button' // Important: prevent form submission
      deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete Event'
      submitBtn.parentNode.insertBefore(deleteBtn, submitBtn)
    }

    // Add click event listener to delete button
    deleteBtn.onclick = showDeleteConfirmation

    modal.style.display = 'block'
  }

  function showDeleteConfirmation() {
    modal.style.display = 'none'
    deleteEventTitle.textContent = selectedEvent.title
    deleteModal.style.display = 'block'
  }

  window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = 'none'
        // Reset form state
        eventForm.reset()
        selectedEvent = null
        const deleteBtn = document.getElementById('deleteEventBtn')
        if (deleteBtn) deleteBtn.remove()
        const submitBtn = eventForm.querySelector('.submit-btn')
        submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Event'
    }
    if (event.target == deleteModal) {
        deleteModal.style.display = 'none'
    }
}

  confirmDeleteBtn.addEventListener('click', async function () {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent)
      } catch (error) {
        console.error('Error in delete confirmation:', error)
        showError('Failed to delete event')
      }
    }
  })

  cancelDeleteBtn.addEventListener('click', function () {
    deleteModal.style.display = 'none'
    modal.style.display = 'block' // Show the event modal again
  })

  async function handleEventDrop(dropInfo) {
    try {
      const event = dropInfo.event
      const response = await fetch(
        `http://studelist-app-api.vercel.app/api/events/${event.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: event.title,
            description: event.extendedProps.description,
            date: event.start.toISOString().split('T')[0],
            time: event.start.toTimeString().slice(0, 5),
            location: event.extendedProps.location,
            category: event.extendedProps.category,
          }),
        }
      )

      if (!response.ok) {
        dropInfo.revert()
        throw new Error('Failed to update event')
      }

      showSuccess('Event updated successfully')
    } catch (error) {
      console.error('Error updating event:', error)
      showError('Failed to update event')
      dropInfo.revert()
    }
  }

  function handleEventResize(resizeInfo) {
    // Handle event resize if needed
    console.log('Event resized:', resizeInfo)
  }

  // CRUD Operations
  async function loadEvents() {
    try {
      const events = await fetchEvents()
      console.log('Events to be added to calendar:', events) // Debug log
      calendar.removeAllEvents()
      events.forEach((event) => {
        calendar.addEvent(event)
      })
    } catch (error) {
      console.error('Error loading events:', error)
      showError('Failed to load events')
    }
  }
  async function fetchEvents() {
    try {
        const response = await fetch('http://studelist-app-api.vercel.app/api/events', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const data = await response.json();
        console.log('Raw events from server:', data.events);
        
        return data.events.map(event => {
            // Create date string with Manila timezone offset
            const dateStr = `${event.date}T${event.time}+08:00`;
            const eventDate = new Date(dateStr);
            
            return {
                id: event.id,
                title: event.title,
                start: eventDate,
                allDay: false,
                description: event.description,
                location: event.location,
                category: event.category || 'other',
                extendedProps: {
                    description: event.description,
                    location: event.location,
                    category: event.category || 'other'
                }
            };
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        showError('Failed to fetch events');
        return [];
    }
}

async function createEvent(eventData) {
    try {
        // Create UTC date
        const localDate = new Date(`${eventData.date}T${eventData.time}`);
        const utcDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);
        
        const formattedData = {
            ...eventData,
            date: utcDate.toISOString().split('T')[0],
            time: eventData.time,
        };

        const response = await fetch('http://studelist-app-api.vercel.app/api/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formattedData),
        });

        if (!response.ok) throw new Error('Failed to create event');

        const result = await response.json();
        showSuccess('Event created successfully');
        return result;
    } catch (error) {
        console.error('Error creating event:', error);
        showError('Failed to create event');
        throw error;
    }
}

  async function deleteEvent(event) {
    try {
      console.log('Deleting event with ID:', event.id) // Debug log

      const response = await fetch(
        `http://studelist-app-api.vercel.app/api/events/${event.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete event')
      }

      // Remove from calendar
      calendar.getEventById(event.id).remove()
      showSuccess('Event deleted successfully')

      // Close modals and reset state
      deleteModal.style.display = 'none'
      modal.style.display = 'none'
      selectedEvent = null

      // Refresh calendar events
      await loadEvents()
    } catch (error) {
      console.error('Error deleting event:', error)
      showError('Failed to delete event: ' + error.message)
    }
  }

  // Form Submission
  eventForm.addEventListener('submit', async function (e) {
    e.preventDefault()

    const eventData = {
      title: eventTitleInput.value,
      description: eventDescriptionInput.value,
      date: eventDateInput.value,
      time: eventTimeInput.value,
      location: eventLocationInput.value,
      category: eventCategorySelect.value,
      reminder: eventReminderSelect.value,
      recurrence: eventRecurrenceSelect.value,
      recurrenceCount: recurrenceCountInput.value,
    }

    try {
      if (selectedEvent) {
        // Update existing event
        await updateEvent(selectedEvent.id, eventData)
      } else {
        // Create new event
        await createEvent(eventData)
      }
      await loadEvents()
      modal.style.display = 'none'
      eventForm.reset()

      // Reset the submit button and remove delete button
      const submitBtn = eventForm.querySelector('.submit-btn')
      submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Event'
      const deleteBtn = document.getElementById('deleteEventBtn')
      if (deleteBtn) deleteBtn.remove()

      selectedEvent = null
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  })

  async function updateEvent(eventId, eventData) {
    try {
      const response = await fetch(
        `http://studelist-app-api.vercel.app/api/events/${eventId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(eventData),
        }
      )

      if (!response.ok) throw new Error('Failed to update event')

      showSuccess('Event updated successfully')
    } catch (error) {
      console.error('Error updating event:', error)
      showError('Failed to update event')
      throw error
    }
  }

  // Search and Filter
  searchInput.addEventListener('input', filterEvents)
  categoryFilter.addEventListener('change', filterEvents)

  function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase()
    const categoryValue = categoryFilter.value

    const events = calendar.getEvents()
    events.forEach((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm) ||
        (event.extendedProps.description || '')
          .toLowerCase()
          .includes(searchTerm)
      const matchesCategory =
        categoryValue === 'all' ||
        event.extendedProps.category === categoryValue

      event.setProp(
        'display',
        matchesSearch && matchesCategory ? 'auto' : 'none'
      )
    })
  }

  // Import/Export
  exportBtn.addEventListener('click', exportEvents)
  importBtn.addEventListener('click', () => importInput.click())
  importInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
      importEvents(e.target.files[0])
    }
  })

  function exportEvents() {
    const events = calendar.getEvents().map((event) => ({
      title: event.title,
      description: event.extendedProps.description,
      date: event.start.toISOString().split('T')[0],
      time: event.start.toTimeString().substring(0, 5),
      location: event.extendedProps.location,
      category: event.extendedProps.category,
    }))

    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(events))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', 'calendar_events.json')
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  function importEvents(file) {
    const reader = new FileReader()
    reader.onload = async function (e) {
      try {
        const events = JSON.parse(e.target.result)
        for (const event of events) {
          await createEvent(event)
        }
        await loadEvents()
        showSuccess('Events imported successfully')
      } catch (error) {
        console.error('Error importing events:', error)
        showError('Failed to import events')
      }
    }
    reader.readAsText(file)
  }

  // Notifications
  function showSuccess(message) {
    const toast = document.createElement('div')
    toast.className = 'toast success'
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`
    document.getElementById('toast-container').appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  function showError(message) {
    const toast = document.createElement('div')
    toast.className = 'toast error'
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`
    document.getElementById('toast-container').appendChild(toast)
    setTimeout(() => toast.remove(), 3000)
  }

  // Initialize
  if ('Notification' in window) {
    Notification.requestPermission()
  }

  initializeCalendar()
})
