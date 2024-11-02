// DOM Elements
const dashboardSection = document.querySelector('#dashboard');
const pomodoroBtn = document.querySelector('#pomodoro-btn');
const pomodoroPopup = document.querySelector('#pomodoro-popup');
const startPauseBtn = document.querySelector('#start-pause');
const resetBtn = document.querySelector('#reset');
const stopwatchDisplay = document.querySelector('#stopwatch');
const pomodoroDisplay = document.querySelector('#pomodoro-timer');
const pomodoroMessage = document.querySelector('#pomodoro-message');
const logoutLink = document.querySelector('#logout');
const hamburgerMenu = document.querySelector('.hamburger-menu');
const overlay = document.querySelector('.overlay');
const topBarProfile = document.querySelector('#topBarProfile');
const sidebarProfile = document.querySelector('#accountContainer');

// Pomodoro Timer Variables
let stopwatchInterval;
let pomodoroInterval;
let stopwatchSeconds = 0;
let pomodoroMinutes = 25;
let pomodoroSeconds = 0;
let isRunning = false;
let isBreakTime = false;

// Initial setup
document.addEventListener('DOMContentLoaded', async function () {
    await verifyToken();
    updateProfiles();
    setupEventListeners();
    loadPomodoroState();
    initializePomodoro();
    
    // Request notification permission
    if ('Notification' in window) {
        Notification.requestPermission();
    }
});

// Save state before page unload
window.addEventListener('beforeunload', savePomodoroState);

function loadSavedTimerState() {
    const savedState = JSON.parse(localStorage.getItem('timerState'));
    if (savedState) {
        const { lastPauseTime, remainingTime, isBreak } = savedState;
        if (lastPauseTime) {
            isBreakTime = isBreak;
            pomodoroMinutes = Math.floor(remainingTime / 60);
            pomodoroSeconds = remainingTime % 60;
            updateDisplays();
        }
    }
}

function saveTimerState() {
    if (isRunning) {
        const totalSeconds = (pomodoroMinutes * 60) + pomodoroSeconds;
        localStorage.setItem('timerState', JSON.stringify({
            lastPauseTime: new Date().getTime(),
            remainingTime: totalSeconds,
            isBreak: isBreakTime
        }));
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Responsive Navigation
    hamburgerMenu.addEventListener('click', toggleSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Profile Navigation
    topBarProfile.addEventListener('click', navigateToProfile);
    sidebarProfile.addEventListener('click', navigateToProfile);

    // Pomodoro Timer Events
    // pomodoroBtn.addEventListener('click', togglePomodoro);
    // startPauseBtn.addEventListener('click', () => pomodoroState.isRunning ? pauseTimer() : startTimer());
    // resetBtn.addEventListener('click', resetTimer);
    // logoutLink.addEventListener('click', handleLogout);
    pomodoroBtn.addEventListener('click', togglePomodoro);
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Close pomodoro when clicking outside
    document.addEventListener('click', (e) => {
        if (!pomodoroPopup.contains(e.target) && e.target !== pomodoroBtn) {
            pomodoroPopup.style.display = 'none';
        }
    });
}

function toggleTimer() {
    if (!isRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
}

// Navigation Functions
function navigateToProfile() {
    window.location.href = '/profile-page/profile.html';
}

function toggleSidebar() {
    hamburgerMenu.classList.toggle('active');
    document.querySelector('.sidebar').classList.toggle('active');
    overlay.classList.toggle('active');
}

function closeSidebar() {
    hamburgerMenu.classList.remove('active');
    document.querySelector('.sidebar').classList.remove('active');
    overlay.classList.remove('active');
}

// Pomodoro State Management
function loadPomodoroState() {
    const savedState = localStorage.getItem(POMODORO_STATE_KEY);
    if (savedState) {
        pomodoroState = JSON.parse(savedState);
        if (pomodoroState.isRunning) {
            const currentTime = Date.now();
            const elapsedSeconds = Math.floor((currentTime - pomodoroState.startTime) / 1000);
            updateTimerAfterReload(elapsedSeconds);
        }
    }
}

function savePomodoroState() {
    if (pomodoroState.isRunning) {
        pomodoroState.startTime = Date.now() - (pomodoroState.stopwatchSeconds * 1000);
    }
    localStorage.setItem(POMODORO_STATE_KEY, JSON.stringify(pomodoroState));
}

function updateTimerAfterReload(elapsedSeconds) {
    pomodoroState.stopwatchSeconds += elapsedSeconds;
    const totalPomodoroSeconds = (pomodoroState.pomodoroMinutes * 60) + pomodoroState.pomodoroSeconds;
    const remainingSeconds = Math.max(0, totalPomodoroSeconds - elapsedSeconds);
    
    pomodoroState.pomodoroMinutes = Math.floor(remainingSeconds / 60);
    pomodoroState.pomodoroSeconds = remainingSeconds % 60;

    if (remainingSeconds <= 0) {
        handlePomodoroComplete();
    } else {
        updateDisplays();
        if (pomodoroState.isRunning) {
            startTimer(false);
        }
    }
}

function initializePomodoro() {
    updateDisplays();
    if (pomodoroState.isRunning) {
        startTimer(false);
        startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    } else {
        startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }
}

// Pomodoro Timer Functions
function togglePomodoro() {
    if (pomodoroPopup.style.display === 'block') {
        pomodoroPopup.style.display = 'none';
    } else {
        pomodoroPopup.style.display = 'block';
        updateDisplays();
    }
}


function startTimer() {
    isRunning = true;
    stopwatchInterval = setInterval(updateStopwatch, 1000);
    pomodoroInterval = setInterval(updatePomodoro, 1000);
    startPauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
    saveTimerState();
}

function pauseTimer() {
    isRunning = false;
    clearInterval(stopwatchInterval);
    clearInterval(pomodoroInterval);
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Resume';
    saveTimerState();
}

function resetTimer() {
    clearInterval(stopwatchInterval);
    clearInterval(pomodoroInterval);
    isRunning = false;
    stopwatchSeconds = 0;
    pomodoroMinutes = isBreakTime ? 5 : 25;
    pomodoroSeconds = 0;
    updateDisplays();
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    pomodoroMessage.style.display = 'none';
    localStorage.removeItem('timerState');
}


function updateDisplays() {
    // Update stopwatch
    const hours = Math.floor(stopwatchSeconds / 3600);
    const minutes = Math.floor((stopwatchSeconds % 3600) / 60);
    const seconds = stopwatchSeconds % 60;
    stopwatchDisplay.textContent = 
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Update pomodoro
    pomodoroDisplay.textContent = 
        `${String(pomodoroMinutes).padStart(2, '0')}:${String(pomodoroSeconds).padStart(2, '0')}`;
}

function updateStopwatch() {
    stopwatchSeconds++;
    updateDisplays();
}

function updatePomodoro() {
    if (pomodoroSeconds === 0) {
        if (pomodoroMinutes === 0) {
            handlePomodoroComplete();
            return;
        }
        pomodoroMinutes--;
        pomodoroSeconds = 59;
    } else {
        pomodoroSeconds--;
    }
    updateDisplays();
}

function handlePomodoroComplete() {
    clearInterval(pomodoroInterval);
    const message = isBreakTime ? 'Break is over! Time to work!' : 'Time for a break!';
    pomodoroMessage.textContent = message;
    pomodoroMessage.style.display = 'block';
    
    // Play notification sound
    try {
        const audio = new Audio('/notification.mp3');
        audio.play();
    } catch (error) {
        console.error('Error playing notification sound:', error);
    }
    
    // Show browser notification
    if (Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
            body: message,
            icon: '/pomodoro-icon.png'
        });
    }
    
    isBreakTime = !isBreakTime;
    
    setTimeout(() => {
        pomodoroMessage.style.display = 'none';
        resetTimer();
    }, 5000);
}


function showNotification(message) {
    if (Notification.permission === 'granted') {
        new Notification('Studelist Pomodoro', {
            body: message,
            icon: '/pomodoro-icon.png'
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(message);
            }
        });
    }
}

// Profile Functions
async function updateProfiles() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/account-container', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch profile data');

        const data = await response.json();
        
        if (data.success && data.user) {
            const fullName = `${data.user.first_name} ${data.user.last_name}`;
            document.getElementById('topBarProfileName').textContent = fullName;
            document.getElementById('name').textContent = fullName;
            document.getElementById('email').textContent = data.user.email;
            
            const topBarPicture = document.getElementById('topBarProfilePicture');
            const sidebarPicture = document.getElementById('profilePicture');
            
            if (data.user.profile_picture) {
                const pictureUrl = data.user.profile_picture;
                topBarPicture.style.backgroundImage = `url(${pictureUrl})`;
                sidebarPicture.style.backgroundImage = `url(${pictureUrl})`;
                topBarPicture.textContent = '';
                sidebarPicture.textContent = '';
            } else {
                const initials = `${data.user.first_name[0]}${data.user.last_name[0]}`.toUpperCase();
                topBarPicture.textContent = initials;
                sidebarPicture.textContent = initials;
                topBarPicture.style.backgroundImage = 'none';
                sidebarPicture.style.backgroundImage = 'none';
            }
        }
    } catch (error) {
        console.error('Error updating profiles:', error);
    }
}

// Authentication Functions
async function verifyToken() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/verify', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Token verification failed');
        }
    } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    }
}

async function handleLogout(e) {
    e.preventDefault();
    
    try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        localStorage.removeItem('token');
        localStorage.removeItem(POMODORO_STATE_KEY);
        window.location.href = 'login.html';
    }
}

// Check for token in URL (for Google OAuth)
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
if (token) {
    localStorage.setItem('token', token);
    window.history.replaceState({}, document.title, window.location.pathname);
}