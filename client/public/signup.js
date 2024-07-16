document.getElementById('signupButton').addEventListener('click', async () => {
    const firstName = document.getElementById('signupFirstName').value.trim();
    const lastName = document.getElementById('signupLastName').value.trim();
    const dob = document.getElementById('signupDob').value.trim();
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value.trim();

    if (!firstName || !lastName || !dob || !username || !email || !password) {
        document.getElementById('signupStatus').textContent = 'All fields are required.';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstName, lastName, dob, username, email, password })
        });

        if (response.ok) {
            const result = await response.json();
            document.getElementById('signupStatus').textContent = 'Signup successful! Redirecting to messaging page...';
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000); // Redirect after 2 seconds
        } else {
            const errorMessage = await response.json().catch(() => null); // Handle empty response
            if (errorMessage) {
                document.getElementById('signupStatus').textContent = errorMessage.message;
            } else {
                document.getElementById('signupStatus').textContent = 'Error signing up. Please try again later.';
            }
        }
    } catch (error) {
        document.getElementById('signupStatus').textContent = 'Error signing up. Please try again later.';
    }
});
