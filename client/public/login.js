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

        console.log('Sending login request to:', baseURL);

        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        // Log response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        if (!response.ok) {
            const errorData = await response.json(); // Parse JSON response for error details
            console.error('Login failed:', errorData.message || errorData);
            throw new Error(errorData.message || 'Error logging in. Please try again later.');
        }

        const data = await response.json(); // Parse JSON response
        console.log('Login successful, response data:', data);

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

fetch('https://studelist-app-api.vercel.app/api/auth/verify', {
    method: 'GET',
    headers: { 'Authorization': 'Bearer testtoken' }
  })
  .then(response => response.json())
  .then(data => console.log('API reachable:', data))
  .catch(error => console.error('API Unreachable:', error));
  