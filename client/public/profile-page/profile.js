document.addEventListener('DOMContentLoaded', async function() {
    // Verify token first
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '../login.html';
        return;
    }

    // Initialize elements
    const elements = {
        fullNameContainer: document.getElementById('fullNameContainer'),
        fullNameSpan: document.getElementById('fullName'),
        firstNameInput: document.getElementById('firstName'),
        lastNameInput: document.getElementById('lastName'),
        editNameButton: document.getElementById('editNameButton'),
        usernameSpan: document.getElementById('username'),
        emailSpan: document.getElementById('email'),
        dobSpan: document.getElementById('dob'),
        bioSpan: document.getElementById('bioSpan'),
        bioTextarea: document.getElementById('bio'),
        socialLinksSpan: document.getElementById('socialLinksSpan'),
        socialLinksInput: document.getElementById('socialLinks'),
        additionalInfoSpan: document.getElementById('additionalInfoSpan'),
        additionalInfoTextarea: document.getElementById('additionalInfo'),
        profilePicture: document.getElementById('profilePicture'),
        profilePictureForm: document.getElementById('profilePictureForm'),
        logoutBtn: document.getElementById('logoutBtn'),
        changePasswordButton: document.getElementById('changePasswordButton'),
        editButtons: document.querySelectorAll('.edit-btn')
    };

    // Fetch and display user profile data
    async function fetchUserProfile() {
        try {
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to fetch profile');

            const data = await response.json();
            
            // Update profile fields
            elements.fullNameSpan.textContent = `${data.user.first_name} ${data.user.last_name}`;
            elements.firstNameInput.value = data.user.first_name;
            elements.lastNameInput.value = data.user.last_name;
            elements.usernameSpan.textContent = data.user.username;
            elements.emailSpan.textContent = data.user.email;
            elements.dobSpan.textContent = data.user.dob ? new Date(data.user.dob).toLocaleDateString() : '';
            elements.bioSpan.textContent = data.user.bio || 'No bio added';
            elements.bioTextarea.value = data.user.bio || '';
            elements.socialLinksSpan.textContent = data.user.social_links || 'No social links added';
            elements.socialLinksInput.value = data.user.social_links || '';
            elements.additionalInfoSpan.textContent = data.user.additional_info || 'No additional information';
            elements.additionalInfoTextarea.value = data.user.additional_info || '';

            // Update profile picture if exists
            if (data.user.profile_picture) {
                elements.profilePicture.src = data.user.profile_picture;
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error loading profile data', 'error');
        }
    }

    // Handle edit button clicks
    function handleEditClick(event) {
        const button = event.target;
        const field = button.dataset.field;
        const container = button.closest('.editable');
        const span = container.querySelector('span');
        const input = container.querySelector('input, textarea');
    
        if (button.textContent === 'Edit') {
            // Switch to edit mode
            button.textContent = 'Save';
            span.style.display = 'none';
            input.style.display = 'block';
            input.focus();
        } else {
            // Save changes and update display
            button.textContent = 'Edit';
            span.style.display = 'block';
            input.style.display = 'none';
            
            // Update the span text immediately
            span.textContent = input.value || `No ${field} added`;
            
            // Save to server
            saveProfile(field, input.value);
        }
    }

    // Handle name edit
    elements.editNameButton.addEventListener('click', function() {
        const isEditing = elements.firstNameInput.style.display === 'none';
        
        if (isEditing) {
            // Switch to edit mode
            elements.fullNameSpan.style.display = 'none';
            elements.firstNameInput.style.display = 'block';
            elements.lastNameInput.style.display = 'block';
            this.textContent = 'Save';
        } else {
            // Save changes
            saveProfile('name', {
                firstName: elements.firstNameInput.value,
                lastName: elements.lastNameInput.value
            });
            elements.fullNameSpan.style.display = 'block';
            elements.firstNameInput.style.display = 'none';
            elements.lastNameInput.style.display = 'none';
            this.textContent = 'Edit';
        }
    });

    // Save profile changes
    async function saveProfile(field, value) {
        try {
            const updateData = {};
            
            if (field === 'name') {
                updateData.first_name = value.firstName;
                updateData.last_name = value.lastName;
            } else if (field === 'bio') {
                updateData.bio = value;
            } else if (field === 'socialLinks') {
                updateData.social_links = value;
            } else if (field === 'additionalInfo') {
                updateData.additional_info = value;
            }
    
            const response = await fetch('http://localhost:3000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(updateData)
            });
    
            if (!response.ok) throw new Error('Failed to update profile');
    
            const data = await response.json();
            showNotification('Profile updated successfully', 'success');
            
            // Update display after successful save
            if (field === 'name') {
                elements.fullNameSpan.textContent = `${data.user.first_name} ${data.user.last_name}`;
            } else if (field === 'bio') {
                elements.bioSpan.textContent = data.user.bio || 'No bio added';
            } else if (field === 'socialLinks') {
                elements.socialLinksSpan.textContent = data.user.social_links || 'No social links added';
            } else if (field === 'additionalInfo') {
                elements.additionalInfoSpan.textContent = data.user.additional_info || 'No additional information';
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error updating profile', 'error');
            // Refresh the profile data in case of error
            fetchUserProfile();
        }
    }

    // Handle profile picture upload
    elements.profilePictureForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(elements.profilePictureForm);

        try {
            const response = await fetch('http://localhost:3000/api/profile/upload-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('Failed to upload picture');

            const data = await response.json();
            elements.profilePicture.src = data.profilePictureUrl;
            showNotification('Profile picture updated successfully', 'success');
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error uploading picture', 'error');
        }
    });

    // Handle password change
    elements.changePasswordButton.addEventListener('click', function() {
        const modal = createPasswordChangeModal();
        document.body.appendChild(modal);
    });

    // Create password change modal
    function createPasswordChangeModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Change Password</h2>
                <form id="passwordChangeForm">
                    <input type="password" placeholder="Current Password" id="currentPassword" required>
                    <input type="password" placeholder="New Password" id="newPassword" required>
                    <input type="password" placeholder="Confirm New Password" id="confirmPassword" required>
                    <button type="submit">Change Password</button>
                    <button type="button" class="cancel">Cancel</button>
                </form>
            </div>
        `;

        const form = modal.querySelector('form');
        const cancelBtn = modal.querySelector('.cancel');

        form.addEventListener('submit', handlePasswordChange);
        cancelBtn.addEventListener('click', () => modal.remove());

        return modal;
    }

    // Handle password change submission
    async function handlePasswordChange(event) {
        event.preventDefault();
        const form = event.target;
        const currentPassword = form.querySelector('#currentPassword').value;
        const newPassword = form.querySelector('#newPassword').value;
        const confirmPassword = form.querySelector('#confirmPassword').value;

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/profile/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (!response.ok) throw new Error('Failed to change password');

            showNotification('Password changed successfully', 'success');
            form.closest('.modal').remove();
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error changing password', 'error');
        }
    }

    // Handle logout
    elements.logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('token');
        window.location.href = '../login.html';
    });

    // Show notifications
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Add event listeners for edit buttons
    elements.editButtons.forEach(button => {
        button.addEventListener('click', handleEditClick);
    });

    // Initial profile load
    fetchUserProfile();
});