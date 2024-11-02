

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

document.addEventListener('DOMContentLoaded', async function() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }

        const response = await fetch('http://studelist-app-api.vercel.app/api/account-container', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        
        if (data.success && data.user) {
            // Update sidebar name and email
            const nameElement = document.getElementById('name');
            const emailElement = document.getElementById('email');
            if (nameElement) nameElement.textContent = `${data.user.first_name} ${data.user.last_name}`;
            if (emailElement) emailElement.textContent = data.user.email;
            
            // Update both profile pictures
            const profilePicture = document.getElementById('profilePicture');
            const topBarProfilePicture = document.getElementById('topBarProfilePicture');
            const topBarProfileName = document.getElementById('topBarProfileName');

            const fullName = `${data.user.first_name} ${data.user.last_name}`;
            const initials = `${data.user.first_name[0]}${data.user.last_name[0]}`.toUpperCase();

            // Update profile pictures
            const updateProfilePicture = (element) => {
                if (element) {
                    if (data.user.profile_picture) {
                        element.style.backgroundImage = `url(${data.user.profile_picture})`;
                        element.textContent = '';
                    } else {
                        element.style.backgroundImage = '';
                        element.textContent = initials;
                    }
                }
            };

            updateProfilePicture(profilePicture);
            updateProfilePicture(topBarProfilePicture);

            // Update topbar name
            if (topBarProfileName) {
                topBarProfileName.textContent = fullName;
            }

            // Add click handlers for profile navigation
            const accountContainer = document.getElementById('accountContainer');
            const topBarProfile = document.getElementById('topBarProfile');

            // Make both profile sections clickable
            if (accountContainer) {
                accountContainer.style.cursor = 'pointer';
                accountContainer.addEventListener('click', navigateToProfile);
            }

            if (topBarProfile) {
                topBarProfile.style.cursor = 'pointer';
                topBarProfile.addEventListener('click', navigateToProfile);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    }
});

// Navigation function
function navigateToProfile() {
    window.location.href = 'profile-page/profile.html';
}

// Logout functionality
const logoutLink = document.getElementById('logout');
if (logoutLink) {
    logoutLink.addEventListener('click', async function (e) {
        e.preventDefault();
        
        try {
            const token = localStorage.getItem('token');
            await fetch('http://studelist-app-api.vercel.app/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        }
    });
}