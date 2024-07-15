// login.js
document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    try {
        if (!email || !password) {
            throw new Error('Please enter both email and password.');
        }

        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.status === 401 || (data && data.message === 'Invalid email or password')) {
            throw new Error('Invalid email or password.');
        }

        if (response.ok && data.success) {
            // Store the token in localStorage
            localStorage.setItem('token', data.token);

            document.getElementById('loginStatus').textContent = 'Login successful!';
            console.log('Login successful!');
            // Delay the redirection to allow the user to see the success message
            setTimeout(() => {
                window.location.href = "main.html"; // Redirect to main.html after successful login
            }, 1000);
        } else {
            console.error('Error during login:', data.message || 'Unknown error.');
            document.getElementById('loginStatus').textContent = data.message || 'Error logging in. Please try again later.';
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        document.getElementById('loginStatus').textContent = error.message || 'Error logging in. Please try again later.';
    }
});
