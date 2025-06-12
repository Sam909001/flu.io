// Configuration
const TOTAL_STAGES = 15;
const STAGE_DURATION = 24 * 60 * 60; // 24h in seconds

// Elements
const stageDisplay = document.getElementById("currentStage");
const timerDisplay = document.getElementById("timer");
const progressFill = document.querySelector(".progress-fill");

// State
let currentStage = 1;
let timeLeft = STAGE_DURATION;

// Update Display
function updateDisplay() {
  // Update timer
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Update progress bar
  progressFill.style.width = `${(currentStage / TOTAL_STAGES) * 100}%`;
  stageDisplay.textContent = currentStage;
}

// Start Countdown
function startCountdown() {
  updateDisplay();
  
  const timer = setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0) {
      if (currentStage < TOTAL_STAGES) {
        currentStage++;
        timeLeft = STAGE_DURATION;
      } else {
        clearInterval(timer);
        timerDisplay.textContent = "COMPLETED!";
      }
    }
    
    updateDisplay();
  }, 1000);
}

// Start immediately on page load
startCountdown();
