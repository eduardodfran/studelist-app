// main.js

const dashboardSection = document.querySelector('#dashboard');
const notesSection = document.querySelector('#notes');
const todoSection = document.querySelector('#todo');
const eventsSection = document.querySelector('#events');

const dashboardTool = document.querySelector('#dashboardTool');
const notesTool = document.querySelector('#notesTool');
const todoTool = document.querySelector('#todoTool');
const eventsTool = document.querySelector('#eventsTool');

const pomodoroBtn = document.querySelector('#pomodoro-btn');
const pomodoroPopup = document.querySelector('#pomodoro-popup');
const startPauseBtn = document.querySelector('#start-pause');
const resetBtn = document.querySelector('#reset');
const stopwatchDisplay = document.querySelector('#stopwatch');
const pomodoroDisplay = document.querySelector('#pomodoro-timer');
const pomodoroMessage = document.querySelector('#pomodoro-message');

const profileLink = document.querySelector('#profile');
const logoutLink = document.querySelector('#logout');

// Initial setup
document.addEventListener('DOMContentLoaded', function () {
    showSection('dashboard');
});

// Tool navigation

dashboardTool.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('dashboard');
    setActive(dashboardTool);
});

notesTool.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('notes');
    setActive(notesTool);
});

todoTool.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('todo');
    setActive(todoTool);
});

eventsTool.addEventListener('click', function (e) {
    e.preventDefault();
    showSection('events');
    setActive(eventsTool);
});

function showSection(sectionId) {
    dashboardSection.classList.remove('show');
    notesSection.classList.remove('show');
    todoSection.classList.remove('show');
    eventsSection.classList.remove('show');

    dashboardSection.classList.add('hide');
    notesSection.classList.add('hide');
    todoSection.classList.add('hide');
    eventsSection.classList.add('hide');

    switch (sectionId) {
        case 'dashboard':
            dashboardSection.classList.remove('hide');
            dashboardSection.classList.add('show');
            break;
        case 'notes':
            notesSection.classList.remove('hide');
            notesSection.classList.add('show');
            break;
        case 'todo':
            todoSection.classList.remove('hide');
            todoSection.classList.add('show');
            break;
        case 'events':
            eventsSection.classList.remove('hide');
            eventsSection.classList.add('show');
            break;
        default:
            break;
    }
}

function setActive(activeElement) {
    const sidebarLinks = document.querySelectorAll('.sidebar-menu a');
    sidebarLinks.forEach(link => {
        link.classList.remove('active');
    });
    activeElement.classList.add('active');
}

// Pomodoro Timer
pomodoroBtn.addEventListener('click', function () {
    if (pomodoroPopup.style.display === 'block') {
        pomodoroPopup.style.display = 'none'; // Close the popup if it's already open
    } else {
        pomodoroPopup.style.display = 'block'; // Open the popup if it's closed
        resetTimer(); // Reset the timer when opening the popup
    }
});

startPauseBtn.addEventListener('click', function () {
    if (startPauseBtn.textContent === 'Start') {
        startTimer();
        startPauseBtn.textContent = 'Pause';
    } else {
        pauseTimer();
        startPauseBtn.textContent = 'Resume';
    }
});

resetBtn.addEventListener('click', function () {
    resetTimer();
    startPauseBtn.textContent = 'Start';
});

let stopwatchInterval;
let pomodoroInterval;
let stopwatchSeconds = 0;
let pomodoroMinutes = 25;
let pomodoroSeconds = 0;
let pomodoroRunning = false;

function startTimer() {
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    pomodoroInterval = setInterval(updatePomodoro, 1000);
    pomodoroRunning = true;
}

function pauseTimer() {
    clearInterval(stopwatchInterval);
    clearInterval(pomodoroInterval);
    pomodoroRunning = false;
}

function resetTimer() {
    clearInterval(stopwatchInterval);
    clearInterval(pomodoroInterval);
    stopwatchSeconds = 0;
    pomodoroMinutes = 25;
    pomodoroSeconds = 0;
    stopwatchDisplay.textContent = '00:00:00';
    pomodoroDisplay.textContent = '25:00';
    pomodoroMessage.style.display = 'none';
    pomodoroRunning = false;
}

function updateStopwatch() {
    stopwatchSeconds++;
    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;
    stopwatchDisplay.textContent = `${hours}:${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
}

function updatePomodoro() {
    if (pomodoroSeconds === 0) {
        pomodoroMinutes--;
        pomodoroSeconds = 59;
    } else {
        pomodoroSeconds--;
    }

    if (pomodoroMinutes === 0 && pomodoroSeconds === 0) {
        clearInterval(pomodoroInterval);
        pomodoroMessage.style.display = 'block';
        setTimeout(() => {
            pomodoroMessage.style.display = 'none';
            resetTimer();
        }, 5000);
    } else {
        pomodoroDisplay.textContent = `${pomodoroMinutes}:${pomodoroSeconds < 10 ? '0' + pomodoroSeconds : pomodoroSeconds}`;
    }
}



// Logout functionality
logoutLink.addEventListener('click', function () {
    localStorage.removeItem('token');
    window.location.href = 'login.html'; // Redirect to login page after logout
});
