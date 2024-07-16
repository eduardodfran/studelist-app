document.addEventListener('DOMContentLoaded', function () {
    const notesSection = document.getElementById('notes');
    const notesList = document.querySelector('.notes-list');
    const addNoteBtn = document.querySelector('.add-note-btn');
    const noteForm = document.querySelector('.note-form');
    const noteTitleInput = document.getElementById('noteTitle');
    const noteContentInput = noteForm.querySelector('textarea');
    let editNoteId = null;

    const noteModal = document.getElementById('noteModal');
    const editNoteForm = document.querySelector('.edit-note-form');
    const editNoteTitleInput = document.getElementById('editNoteTitle');
    const editNoteContentInput = document.getElementById('editNoteContent');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const modalCloseBtn = document.querySelector('.close');

    showSection('dashboard');
    fetchNotes(notesList);

    addNoteBtn.addEventListener('click', function () {
        noteForm.style.display = 'block';
        noteTitleInput.focus();
    });

    noteForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const title = noteTitleInput.value.trim();
        const content = noteContentInput.value.trim();

        if (!title) {
            alert('Title is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) {
                throw new Error('Error creating note');
            }

            const data = await response.json();
            if (data.success) {
                noteForm.reset();
                noteForm.style.display = 'none';
                fetchNotes(notesList);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error creating note:', error);
        }
    });

    modalCloseBtn.addEventListener('click', function () {
        noteModal.style.display = 'none';
        editNoteId = null;
        editNoteForm.reset();
    });

    window.addEventListener('click', function (event) {
        if (event.target === noteModal) {
            noteModal.style.display = 'none';
            editNoteId = null;
            editNoteForm.reset();
        }
    });

    editNoteForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const title = editNoteTitleInput.value.trim();
        const content = editNoteContentInput.value.trim();

        if (!title) {
            alert('Title is required');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/notes/${editNoteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            });

            if (!response.ok) {
                throw new Error(response.statusText);
            }

            const data = await response.json();
            if (data.success) {
                noteModal.style.display = 'none';
                editNoteId = null;
                fetchNotes(notesList);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error updating note:', error);
        }
    });

    deleteNoteBtn.addEventListener('click', async function () {
        const confirmDelete = confirm('Are you sure you want to delete this note?');

        if (confirmDelete) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://localhost:3000/api/notes/${editNoteId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    throw new Error('Error deleting note');
                }

                const data = await response.json();
                if (data.success) {
                    noteModal.style.display = 'none';
                    editNoteId = null;
                    fetchNotes(notesList);
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    });

    async function fetchNotes(notesList) {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/notes', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error fetching notes');
            }

            const data = await response.json();
            if (data.success) {
                notesList.innerHTML = '';
                data.notes.forEach(note => {
                    const noteItem = document.createElement('div');
                    noteItem.classList.add('note-item');
                    noteItem.innerHTML = 
                        `<h3>${note.title}</h3>
                        <p>${note.content}</p>
                        <small>${new Date(note.created_at).toLocaleString()}</small>`
                    ;
                    noteItem.addEventListener('click', () => openNoteModal(note));
                    notesList.appendChild(noteItem);
                });
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        }
    }

    function openNoteModal(note) {
        editNoteId = note.id;
        editNoteTitleInput.value = note.title;
        editNoteContentInput.value = note.content;
        noteModal.style.display = 'block';
    }
});


