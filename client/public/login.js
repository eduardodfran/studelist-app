document.addEventListener('DOMContentLoaded', () => {
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('loginPassword');

  togglePassword.addEventListener('click', function() {
      // Toggle the password visibility
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Toggle the eye icon
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
  });
});

document.getElementById('loginButton').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    // Log the exact URL and request details
    const baseURL = 'http://localhost:3000/api/auth/login';
    console.log('Attempting to login with:', {
        url: baseURL,
        email: email,
        method: 'POST'
    });

    try {
        if (!email || !password) {
            throw new Error('Please enter both email and password.');
        }

        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        console.log('Response details:', {
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers)
        });


    // Log response for debugging
    console.log('Response status:', response.status)
    console.log('Response headers:', response.headers)

    // ... existing code ...
    if (!response.ok) {
      let errorData
      try {
        errorData = await response.json()
      } catch (e) {
        errorData = {
          message: `Server returned ${response.status}: ${response.statusText}`,
        }
      }
      console.error('Login failed:', errorData)
      throw new Error(errorData.message || `Server error: ${response.status}`)
    }
    // ... existing code ...

    const data = await response.json() // Parse JSON response
    console.log('Login successful, response data:', data)

    if (data.success) {
      localStorage.setItem('token', data.token)
      document.getElementById('loginStatus').textContent = 'Login successful!'
      setTimeout(() => {
        window.location.href = 'main.html'
      }, 1000)
    } else {
      document.getElementById('loginStatus').textContent =
        data.message || 'Error logging in. Please try again later.'
    }
  } catch (error) {
    console.error('Error during login:', error.message)
    document.getElementById('loginStatus').textContent =
      error.message || 'Error logging in. Please try again later.'
  }
})

