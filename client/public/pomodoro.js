document.addEventListener('DOMContentLoaded', function() {
    const pomodoroBtn = document.querySelector('#pomodoro-btn');
    const pomodoroPopup = document.querySelector('#pomodoro-popup');
    const startPauseBtn = document.querySelector('#start-pause');
    const resetBtn = document.querySelector('#reset');
    const stopwatchDisplay = document.querySelector('#stopwatch');
    const pomodoroDisplay = document.querySelector('#pomodoro-timer');
    const pomodoroMessage = document.querySelector('#pomodoro-message');

    let stopwatchInterval;
    let pomodoroInterval;
    let stopwatchSeconds = 0;
    let pomodoroMinutes = 25;
    let pomodoroSeconds = 0;
    let pomodoroRunning = false;

    pomodoroBtn.addEventListener('click', function () {
        if (pomodoroPopup.style.display === 'block') {
            pomodoroPopup.style.display = 'none';
        } else {
            pomodoroPopup.style.display = 'block';
            resetTimer();
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
});