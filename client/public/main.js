/* DOM elements */
const dashboardSection = document.getElementById('dashboard');
const notesSection = document.getElementById('notes');
const todoSection = document.getElementById('todo');
const eventsSection = document.getElementById('events');

const dashboardTool = document.getElementById('dashboardTool');
const notesTool = document.getElementById('notesTool');
const todoTool = document.getElementById('todoTool');
const eventsTool = document.getElementById('eventsTool');

const pomodoroBtn = document.getElementById('pomodoro-btn');
const pomodoroPopup = document.getElementById('pomodoro-popup');
const startPauseBtn = document.getElementById('start-pause');
const resetBtn = document.getElementById('reset');
const stopwatchDisplay = document.getElementById('stopwatch');
const pomodoroDisplay = document.getElementById('pomodoro-timer');
const pomodoroMessage = document.getElementById('pomodoro-message');

const profileLink = document.getElementById('profile');
const logoutLink = document.getElementById('logout');

// Initial setup
document.addEventListener('DOMContentLoaded', function () {
  showSection('dashboard');
});

// Tool navigation

dashboard.addEventListener('click', function (e) {
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

// Profile and Logout dropdown


logoutLink.addEventListener('click', function () {
  // Logic to handle logout
  // Redirect or clear session
  // For demonstration purposes, reload the page
  location.reload();
});


