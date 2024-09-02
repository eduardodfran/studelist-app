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

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);

        const responseText = await response.text(); // Get raw response text
        console.log('Raw response:', responseText);

        // Handle non-JSON responses
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            throw new Error('Invalid JSON response from server');
        }

        if (!response.ok) {
            throw new Error(data.message || 'Error logging in. Please try again later.');
        }

        if (data.success) {
            localStorage.setItem('token', data.token);
            document.getElementById('loginStatus').textContent = 'Login successful!';
            console.log('Login successful!');
            setTimeout(() => {
                window.location.href = "main.html";
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
