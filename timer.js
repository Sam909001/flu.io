// Timer Configuration
const TOTAL_STAGES = 15;
const STAGE_DURATION = 86399; // 23:59:59 in seconds

// State Management
let currentStage = 1;
let timeLeft = STAGE_DURATION;
let timerInterval;

// DOM Elements
const stageDisplay = document.getElementById("currentStage");
const timerDisplay = document.querySelector(".timer-display");
const startBtn = document.getElementById("startTimer");
const resetStageBtn = document.getElementById("resetTimer");
const resetAllBtn = document.getElementById("resetAll");

// Update Timer Display
function updateTimerDisplay() {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  timerDisplay.textContent = 
    `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Start Timer
function startTimer() {
  if (!timerInterval && currentStage <= TOTAL_STAGES) {
    timerInterval = setInterval(() => {
      if (timeLeft > 0) {
        timeLeft--;
        updateTimerDisplay();
      } else {
        clearInterval(timerInterval);
        if (currentStage < TOTAL_STAGES) {
          currentStage++;
          stageDisplay.textContent = currentStage;
          timeLeft = STAGE_DURATION;
          updateTimerDisplay();
          alert(`Stage ${currentStage - 1} completed! Starting Stage ${currentStage}.`);
        } else {
          alert("All stages completed! 🎉");
        }
      }
    }, 1000);
  }
}

// Reset Current Stage
function resetStage() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = STAGE_DURATION;
  updateTimerDisplay();
}

// Reset All Progress
function resetAll() {
  clearInterval(timerInterval);
  timerInterval = null;
  currentStage = 1;
  stageDisplay.textContent = currentStage;
  timeLeft = STAGE_DURATION;
  updateTimerDisplay();
}

// Event Listeners
startBtn.addEventListener("click", startTimer);
resetStageBtn.addEventListener("click", resetStage);
resetAllBtn.addEventListener("click", resetAll);

// Initialize
updateTimerDisplay();
