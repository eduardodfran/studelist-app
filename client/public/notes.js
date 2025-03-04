document.addEventListener('DOMContentLoaded', async function () {
    // DOM Elements
    const notesList = document.querySelector('.notes-list');
    const addNoteBtn = document.querySelector('.add-note-btn');
    const noteModal = document.getElementById('noteModal');
    const editNoteForm = document.querySelector('.edit-note-form');
    const editNoteTitleInput = document.getElementById('editNoteTitle');
    const editNoteFolder = document.getElementById('editNoteFolder');
    const deleteNoteBtn = document.getElementById('deleteNoteBtn');
    const modalCloseBtn = document.querySelector('.close');
    const searchInput = document.getElementById('searchNotes');
    const folderSelect = document.getElementById('folderSelect');
    const deleteConfirmModal = document.getElementById('deleteConfirmModal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const newFolderModal = document.getElementById('newFolderModal');
const newFolderForm = document.getElementById('newFolderForm');
const newFolderInput = document.getElementById('newFolderName');
const cancelNewFolderBtn = document.getElementById('cancelNewFolder');
const deleteFolderModal = document.getElementById('deleteFolderModal');
const confirmDeleteFolderBtn = document.getElementById('confirmDeleteFolder');
const cancelDeleteFolderBtn = document.getElementById('cancelDeleteFolder');
let folderToDelete = null;

    // State variables
    let editNoteId = null;
    let currentNotes = [];
    let folders = ['Personal', 'Work', 'Study'];
    let quill;

    // Initialize Quill
    function initializeQuill() {
        quill = new Quill('#editor-container', {
            theme: 'snow',
            modules: {
                clipboard: {
                    matchVisual: false // This helps maintain plain text formatting
                },
                toolbar: [
                    ['bold', 'italic', 'underline', 'strike'],
                    ['blockquote', 'code-block'],
                    [{ 'header': 1 }, { 'header': 2 }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'script': 'sub'}, { 'script': 'super' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'font': [] }],
                    [{ 'align': [] }],
                    ['link', 'image', 'video'],
                    ['clean']
                ]
            },
            placeholder: 'Write your note here...'
        });
    
        // Add paste handling
        quill.clipboard.addMatcher(Node.ELEMENT_NODE, function(node, delta) {
            let ops = [];
            delta.ops.forEach(op => {
                if (op.insert && typeof op.insert === 'string') {
                    // Split the text by newlines and create proper paragraphs
                    let texts = op.insert.split('\n');
                    texts.forEach((text, i) => {
                        if (text) {
                            ops.push({ insert: text });
                        }
                        if (i < texts.length - 1) {
                            ops.push({ insert: '\n' });
                        }
                    });
                } else {
                    ops.push(op);
                }
            });
            delta.ops = ops;
            return delta;
        });
    }

    // Initialize
    await verifyToken();
    fetchNotes();
    setupEventListeners();
    initializeQuill();
    loadFolders();

    // Token Verification
    async function verifyToken() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/verify', {
                headers: {
                    Authorization: `Bearer ${token}`,
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

    // Event Listeners
    function setupEventListeners() {
        addNoteBtn.addEventListener('click', () => openNoteModal());
        editNoteForm.addEventListener('submit', handleNoteEdit);
        deleteNoteBtn.addEventListener('click', handleNoteDelete);
        modalCloseBtn.addEventListener('click', closeModal);
        searchInput.addEventListener('input', debounce(handleSearch, 300));
        folderSelect.addEventListener('change', handleFolderChange);
        deleteNoteBtn.addEventListener('click', showDeleteConfirmation);
        cancelDeleteBtn.addEventListener('click', hideDeleteConfirmation);
        confirmDeleteBtn.addEventListener('click', handleNoteDelete);
        newFolderForm.addEventListener('submit', handleNewFolder);
        cancelNewFolderBtn.addEventListener('click', closeNewFolderModal);
        newFolderModal.querySelector('.close').addEventListener('click', closeNewFolderModal);
        window.addEventListener('click', (e) => {
            if (e.target === noteModal) {
                closeModal();
            }
            if (e.target === newFolderModal) {
                closeNewFolderModal();
            }
            if (e.target === deleteFolderModal) {
                hideFolderDeleteConfirmation();
            }
        });
        confirmDeleteFolderBtn.addEventListener('click', handleFolderDelete);
        cancelDeleteFolderBtn.addEventListener('click', hideFolderDeleteConfirmation);
    }

    async function handleNewFolder(e) {
        e.preventDefault();
        const folderName = newFolderInput.value.trim();
    
        if (!folderName) {
            showError('Please enter a folder name');
            return;
        }
    
        if (folders.includes(folderName)) {
            showError('This folder already exists');
            return;
        }
    
        try {
            // Add folder to the array
            folders.push(folderName);
            
            // Update UI
            loadFolders();
            folderSelect.value = folderName;
            handleFolderChange({ target: folderSelect });

            // Close modal and reset form
            closeNewFolderModal();
            showSuccess('Folder created successfully');
        } catch (error) {
            console.error('Error creating folder:', error);
            showError('Failed to create folder');
        }
    }

    // Add this new function to handle modal closing
    function closeNewFolderModal() {
        newFolderModal.style.display = 'none';
        newFolderForm.reset();
    }

    // Fetch Notes
    async function fetchNotes() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:3000/api/notes', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const data = await response.json();
            if (data.success) {
                currentNotes = data.notes;
                renderNotes(currentNotes);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
            alert('Error fetching notes. Please try again.');
        }
    }

    // Render Notes
    function renderNotes(notes) {
        notesList.innerHTML = notes.map(note => `
            <div class="note-item" data-note-id="${note.id}">
                <h3>${note.title}</h3>
                <div class="note-content">${stripHtml(note.content).slice(0, 150)}${note.content.length > 150 ? '...' : ''}</div>
                ${note.folder ? `<div class="note-folder">${note.folder}</div>` : ''}
            </div>
        `).join('');
    
        // Add click event listeners to all note items
        document.querySelectorAll('.note-item').forEach(noteItem => {
            noteItem.addEventListener('click', () => {
                const noteId = parseInt(noteItem.dataset.noteId);
                openNoteModal(noteId);
            });
        });
    }

    // Strip HTML tags for preview
    function stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    // Handle Note Edit
    async function handleNoteEdit(e) {
        e.preventDefault();
        const title = editNoteTitleInput.value.trim();
        const content = quill.root.innerHTML;
        const folder = editNoteFolder.value;

        if (!title) {
            alert('Please enter a title for your note.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const method = editNoteId ? 'PUT' : 'POST';
            const url = editNoteId 
                ? `http://localhost:3000/api/notes/${editNoteId}`
                : 'http://localhost:3000/api/notes';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ title, content, folder }),
            });

            const data = await response.json();
            if (data.success) {
                closeModal();
                fetchNotes();
            }
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note. Please try again.');
        }
    }

    function showDeleteConfirmation() {
        deleteConfirmModal.style.display = 'block';
    }
    
    function hideDeleteConfirmation() {
        deleteConfirmModal.style.display = 'none';
    }

    // Handle Note Delete
    async function handleNoteDelete() {
        if (!editNoteId) return;
    
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://stlocalhost:3000/api/notes/${editNoteId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    
            const data = await response.json();
            if (data.success) {
                hideDeleteConfirmation();
                closeModal();
                fetchNotes();
            }
        } catch (error) {
            console.error('Error deleting note:', error);
            alert('Error deleting note. Please try again.');
        }
    }

    // Modal Functions
    function openNoteModal(noteId = null) {
        editNoteId = noteId;
        if (noteId) {
            const note = currentNotes.find(n => n.id === noteId);
            if (note) {
                editNoteTitleInput.value = note.title;
                quill.root.innerHTML = note.content || '';
                editNoteFolder.value = note.folder || '';
            }
        } else {
            editNoteTitleInput.value = '';
            quill.root.innerHTML = '';
            editNoteFolder.value = '';
        }
        noteModal.style.display = 'block';
    }

    function closeModal() {
        noteModal.style.display = 'none';
        deleteConfirmModal.style.display = 'none';
        editNoteId = null;
        editNoteForm.reset();
        quill.root.innerHTML = '';
    }

    // Search and Filter Functions
    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedFolder = folderSelect.value;
        
        let filteredNotes = currentNotes.filter(note => 
            note.title.toLowerCase().includes(searchTerm) || 
            stripHtml(note.content).toLowerCase().includes(searchTerm)
        );

        if (selectedFolder && selectedFolder !== 'all') {
            filteredNotes = filteredNotes.filter(note => note.folder === selectedFolder);
        }

        renderNotes(filteredNotes);
    }

    function handleFolderChange(e) {
        const selectedFolder = folderSelect.value;
        
        // Handle the "Add New Folder" option
        if (selectedFolder === 'add') {
            folderSelect.value = folderSelect.dataset.previousValue || 'all';
            newFolderModal.style.display = 'block';
            newFolderInput.focus();
            return;
        }

        // Handle folder deletion when trash icon is clicked
        if (e.target.closest('.trash-icon')) {
            e.preventDefault();
            e.stopPropagation();
            const folder = e.target.closest('option').value;
            showFolderDeleteConfirmation(folder);
            return;
        }
        
        // Store the current value for next time
        folderSelect.dataset.previousValue = selectedFolder;

        // Filter notes based on selected folder
        const filteredNotes = selectedFolder === 'all' 
            ? currentNotes 
            : currentNotes.filter(note => note.folder === selectedFolder);
        renderNotes(filteredNotes);
    }

    // Utility Functions
function loadFolders() {
    const folderSelects = document.querySelectorAll('#folderSelect, #editNoteFolder');
    folderSelects.forEach(select => {
        const isMainSelect = select.id === 'folderSelect';
        
        // Get note counts for each folder
        const folderCounts = folders.reduce((acc, folder) => {
            acc[folder] = currentNotes.filter(note => note.folder === folder).length;
            return acc;
        }, {});

        select.innerHTML = `
            ${isMainSelect ? `<option value="all">All Notes (${currentNotes.length})</option>` : '<option value="">Select Folder</option>'}
            ${folders.map(folder => `
                <option value="${folder}" data-folder="${folder}">
                    ${folder} (${folderCounts[folder]}) 
                    ${isMainSelect ? '<i class="fas fa-trash trash-icon" title="Delete folder"></i>' : ''}
                </option>
            `).join('')}
            ${isMainSelect ? '<option value="add">+ New Folder</option>' : ''}
        `;
    });
}

    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function showFolderDeleteConfirmation(folder) {
        const notesInFolder = currentNotes.filter(note => note.folder === folder);
        const noteCount = notesInFolder.length;
        
        folderToDelete = folder;
        
        // Update the confirmation message with note count
        const confirmMessage = document.querySelector('#deleteFolderModal p');
        confirmMessage.textContent = `Are you sure you want to delete "${folder}"? ${
            noteCount 
                ? `${noteCount} note${noteCount > 1 ? 's' : ''} will be moved to "Unfiled".` 
                : 'This folder is empty.'
        }`;
        
        deleteFolderModal.style.display = 'block';
    }

    function hideFolderDeleteConfirmation() {
        deleteFolderModal.style.display = 'none';
        folderToDelete = null;
    }

    async function handleFolderDelete() {
        if (!folderToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/notes/folders/${encodeURIComponent(folderToDelete)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete folder');
            }

            // Remove folder from local array
            folders = folders.filter(f => f !== folderToDelete);
            
            // Update UI
            loadFolders();
            folderSelect.value = 'all';
            await fetchNotes(); // Refresh notes to get updated folder assignments
            hideFolderDeleteConfirmation();
            
            // Show success message with affected notes count
            showSuccess(
                `Folder "${folderToDelete}" deleted successfully. ${
                    data.affectedNotes 
                        ? `${data.affectedNotes} note${data.affectedNotes > 1 ? 's' : ''} moved to "Unfiled".`
                        : ''
                }`
            );
        } catch (error) {
            console.error('Error deleting folder:', error);
            showError(`Failed to delete folder: ${error.message}`);
            hideFolderDeleteConfirmation();
        }
    }
});

window.addEventListener('click', (e) => {
    if (e.target === noteModal) {
        closeModal();
    }
    if (e.target === deleteConfirmModal) {
        hideDeleteConfirmation();
    }
    if (e.target === deleteFolderModal) {
        hideFolderDeleteConfirmation();
    }
});

// Add this CSS for better folder display
const style = document.createElement('style');
style.textContent = `
    .folder-select option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
    }

    .folder-select option[data-folder]::after {
        content: attr(data-folder);
        font-size: 0.9em;
        color: #666;
    }

    .trash-icon {
        float: right;
        color: #e74c3c;
        opacity: 0.7;
        cursor: pointer;
        margin-left: 8px;
    }

    .trash-icon:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);