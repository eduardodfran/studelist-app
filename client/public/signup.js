document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('signupPassword');

    togglePassword.addEventListener('click', function() {
        // Toggle the password visibility
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        
        // Toggle the eye icon
        this.querySelector('i').classList.toggle('fa-eye');
        this.querySelector('i').classList.toggle('fa-eye-slash');
    });
});

document.getElementById('signupButton').addEventListener('click', async () => {
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const dob = document.getElementById('signupDob').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    // Clear previous error messages
    document.getElementById('signupStatus').textContent = '';

    // Validate inputs
    if (!firstName || !lastName || !dob || !username || !email || !password) {
        document.getElementById('signupStatus').textContent = 'All fields are required.';
        return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        document.getElementById('signupStatus').textContent = 'Please enter a valid email address.';
        return;
    }

    // Validate password strength
    if (password.length < 6) {
        document.getElementById('signupStatus').textContent = 'Password must be at least 6 characters long.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName,
                lastName,
                dob,
                username,
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('signupStatus').textContent = 'Signup successful! Redirecting to login page...';
            document.getElementById('signupStatus').style.color = 'green';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            document.getElementById('signupStatus').textContent = data.message || 'Error signing up. Please try again.';
            document.getElementById('signupStatus').style.color = 'red';
        }
    } catch (error) {
        console.error('Signup error:', error);
        document.getElementById('signupStatus').textContent = 'Network error. Please try again later.';
        document.getElementById('signupStatus').style.color = 'red';
    }
});