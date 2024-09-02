document.getElementById('loginButton').addEventListener('click', async () => {
    console.log('Login button clicked');
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Define base URL based on environment
    const baseURL = window.location.hostname === 'localhost'
        ? 'http://localhost:3000/api/auth/login'
        : 'https://studelist-app-api.vercel.app/api/auth/login';

    try {
        if (!email || !password) {
            throw new Error('Please enter both email and password.');
        }

        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Check if response status is OK
        if (!response.ok) {
            const errorText = await response.text(); // Read response text for error details
            throw new Error(errorText || 'Error logging in. Please try again later.');
        }

        const data = await response.json(); // Parse JSON response

        if (data.success) {
            localStorage.setItem('token', data.token);
            document.getElementById('loginStatus').textContent = 'Login successful!';
            setTimeout(() => {
                window.location.href = "main.html";
            }, 1000);
        } else {
            document.getElementById('loginStatus').textContent = data.message || 'Error logging in. Please try again later.';
        }
    } catch (error) {
        console.error('Error during login:', error.message);
        document.getElementById('loginStatus').textContent = error.message || 'Error logging in. Please try again later.';
    }
});
