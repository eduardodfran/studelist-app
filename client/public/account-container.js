document.addEventListener('DOMContentLoaded', async function () {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No token found');
        }

        const response = await fetch('http://localhost:3000/api/account-container', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(`Failed to fetch user profile: ${errorMessage}`);
        }

        const data = await response.json();
        console.log('Full response data:', data);

        if (!data.success) {
            throw new Error(data.message);
        }

        const { user } = data;

        if (!user) {
            throw new Error('User data not found in response');
        }

        const { first_name, last_name, email, profile_picture } = user;

        if (!first_name || !last_name || !email) {
            throw new Error('Missing required user data');
        }

        // Update DOM elements with user profile information
        document.getElementById('name').textContent = `${first_name} ${last_name}`;
        document.getElementById('email').textContent = email;

        // Set profile picture
        const profilePictureElement = document.getElementById('profilePicture');
        if (profile_picture) {
            profilePictureElement.style.backgroundImage = `url(${profile_picture})`;
            profilePictureElement.textContent = '';
        } else {
            // Set profile picture initials
            const initials = `${first_name[0]}${last_name[0]}`;
            profilePictureElement.textContent = initials;
        }

    } catch (error) {
        console.error('Error fetching user profile:', error);

        const errorMessage = error.message || 'Unknown error';
        const errorElement = document.getElementById('errorMessage');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    }
});

