document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form');
    const input = document.getElementById('input');
    const messagesContainer = document.getElementById('messages');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const message = input.value.trim();
        if (!message) return;

        // Clear input field
        input.value = '';

        // Add user message to UI
        addMessageToUI(message, true);

        try {
            // Send user message to backend
            const response = await fetch('/chat/query', { // Ensure correct endpoint path
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch response');
            }

            const data = await response.json(); // Attempt to parse JSON

            // Add AI response to UI
            if (data.message) {
                addMessageToUI(data.message, false);
            } else {
                console.error('Error fetching chatbot response:', new Error('Invalid JSON response'));
                addMessageToUI('Oops! Something went wrong.', false);
            }
        } catch (error) {
            console.error('Error fetching chatbot response:', error);
            addMessageToUI('Oops! Something went wrong.', false);
        }
    });

    function addMessageToUI(message, isUser) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', isUser ? 'user-message' : 'ai-message');
        messageElement.innerText = message;

        messagesContainer.appendChild(messageElement);

        // Scroll to bottom of messages
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
});

testDialogflowConnection();