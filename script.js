// --- Global State ---
let userWallet = null;
const leaderboard = JSON.parse(localStorage.getItem('fluffiLeaderboard')) || {};
const initialPrice = 0.0001;

// --- DOM Elements ---
const elements = {
  walletButton: document.getElementById('walletButton'),
  amountInput: document.getElementById('amountInput'),
  stakeInput: document.getElementById('stakeInput'),
  refInput: document.getElementById('refInput'),
  currentPrice: document.getElementById('currentPrice'),
  stageInfo: document.getElementById('stageInfo'),
  priceInfo: document.getElementById('priceInfo'),
  countdown: document.getElementById('countdown'),
  leaderboard: document.getElementById('leaderboard'),
  referralSection: document.getElementById('referralSection')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initReferralSystem();
  startTokenCounter();
  renderLeaderboard();
  
  // Set up intervals
  setInterval(simulatePriceMovement, 5000);
});

// --- Unified Wallet Connection ---
async function connectWallet() {
  if (!window.ethereum) {
    alert('Please install MetaMask!');
    return;
  }

  try {
    // Disable all connect buttons
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = "Connecting...";
    });

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userWallet = accounts[0];
    
    // Update UI
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.textContent = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;
      btn.disabled = false;
    });

    // Update referral section if exists
    if (elements.referralSection) {
      generateReferralUI();
    }
    
  } catch (error) {
    console.error("Connection failed:", error);
    alert(`Error: ${error.message}`);
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.disabled = false;
      btn.textContent = "Connect Wallet";
    });
  }
}

// --- Referral System ---
function initReferralSystem() {
  // Check URL for referral parameter
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  
  if (refCode && /^0x[a-fA-F0-9]{40}$/.test(refCode)) {
    localStorage.setItem('fluffiRef', refCode);
    console.log(`Referral detected: ${refCode}`);
  }
  
  // Apply to input field if exists
  if (elements.refInput) {
    elements.refInput.value = localStorage.getItem('fluffiRef') || '';
  }
}

function generateReferralUI() {
  if (!userWallet || !elements.referralSection) return;
  
  elements.referralSection.innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block mb-2">Your referral link:</label>
        <div class="flex">
          <input type="text" id="userReferralLink" 
                value="${window.location.origin}?ref=${userWallet}" 
                class="flex-1 p-2 border rounded-l dark:bg-gray-700" readonly>
          <button onclick="copyReferralLink()" 
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r">
            Copy
          </button>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded">
        <p>Total referrals: <span id="referralCount">${leaderboard[userWallet]?.toFixed(2) || 0}</span></p>
        <p>Earnings: <span id="referralEarnings">${(leaderboard[userWallet] * 0.1)?.toFixed(2) || 0} FLUFFI</span></p>
      </div>
    </div>
  `;
}

function copyReferralLink() {
  const input = document.getElementById('userReferralLink');
  if (!input) return;
  
  input.select();
  document.execCommand('copy');
  
  // Visual feedback
  const button = input.nextElementSibling;
  button.textContent = 'Copied!';
  setTimeout(() => {
    button.textContent = 'Copy';
  }, 2000);
}

// --- Purchase Function ---
async function buyFluffi() {
  if (!userWallet) {
    alert('Please connect wallet first');
    return;
  }

  const amount = parseFloat(elements.amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert('Please enter valid amount');
    return;
  }

  try {
    // Get referrer from localStorage or input
    const ref = localStorage.getItem('fluffiRef') || elements.refInput?.value;
    
    // Simulate purchase (replace with actual contract call)
    if (ref && ref !== userWallet) {
      const reward = amount * 0.1; // 10% referral reward
      leaderboard[ref] = (leaderboard[ref] || 0) + reward;
      localStorage.setItem('fluffiLeaderboard', JSON.stringify(leaderboard));
      alert(`Purchase successful! Referrer earned $${reward.toFixed(2)} bonus.`);
    } else {
      alert('Purchase successful!');
    }
    
    // Update UI
    renderLeaderboard();
    if (elements.referralSection) generateReferralUI();
    
  } catch (error) {
    console.error("Purchase failed:", error);
    alert(`Error: ${error.message}`);
  }
}

// --- Leaderboard ---
function renderLeaderboard() {
  if (!elements.leaderboard) return;
  
  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  elements.leaderboard.innerHTML = `
    <h3 class="text-lg font-bold mb-2">Top Referrers</h3>
    ${sorted.length ? 
      sorted.map(([addr, amt], i) => `
        <p class="text-sm">
          ${i+1}. ${addr.slice(0, 6)}...${addr.slice(-4)} - $${amt.toFixed(2)}
        </p>
      `).join('') : 
      '<p class="text-sm text-gray-500">No referrals yet</p>'
    }
  `;
}
// --- Stage & Price Logic ---
const TOTAL_STAGES = 15;
const STAGE_DURATION = 60; // 1 minute in seconds

// Load or initialize timer state
localStorage.removeItem('fluffiTimer'); // <-- Optional: force reset every reload for test
const savedState = {
  startTime: Math.floor(Date.now() / 1000),
  currentStage: 1
};

// Calculate current state
const now = Math.floor(Date.now() / 1000);
const elapsedSeconds = now - savedState.startTime;
let currentStage = Math.min(
  savedState.currentStage + Math.floor(elapsedSeconds / STAGE_DURATION), 
  TOTAL_STAGES
);
let timeLeft = STAGE_DURATION - (elapsedSeconds % STAGE_DURATION);

// Update display
function updateTimerDisplay() {
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;
  
  // Update 24h timer
  if (document.getElementById("timer")) {
    document.getElementById("timer").textContent = 
      `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  
  // Update progress bar
  if (document.getElementById("progressFill")) {
    document.getElementById("progressFill").style.width = `${(currentStage / TOTAL_STAGES) * 100}%`;
  }
  
  // Update stage counter
  if (document.getElementById("currentStage")) {
    document.getElementById("currentStage").textContent = currentStage;
  }
  
  // Update price
  const price = (initialPrice * Math.pow(1.05, currentStage - 1)).toFixed(6);
  if (elements.priceInfo) elements.priceInfo.textContent = `Price: $${price}`;
  
  // Update days counter (preserve this functionality)
  const daysLeft = Math.floor(((TOTAL_STAGES - currentStage) * STAGE_DURATION + timeLeft) / 86400);
  if (elements.countdown) {
    elements.countdown.textContent = `Ends in: ${daysLeft}d`;
  }
}

// Start the countdown
function startCountdown() {
  updateTimerDisplay();
  
  const timer = setInterval(() => {
    timeLeft--;
    
    if (timeLeft <= 0 && currentStage < TOTAL_STAGES) {
      currentStage++;
      timeLeft = STAGE_DURATION;
      localStorage.setItem('fluffiTimer', JSON.stringify({
        startTime: Math.floor(Date.now() / 1000),
        currentStage: currentStage
      }));
    }
    
    updateTimerDisplay();
  }, 1000);
}

// Initialize timer
document.addEventListener('DOMContentLoaded', startCountdown);
// --- Token Counter ---
function startTokenCounter() {
  const counter = document.getElementById('tokensSold');
  if (!counter) return;
  
  let count = 8421509;
  setInterval(() => {
    count += Math.floor(Math.random() * 500) + 100;
    counter.textContent = count.toLocaleString();
    counter.classList.add('text-green-500', 'scale-110');
    setTimeout(() => {
      counter.classList.remove('text-green-500', 'scale-110');
    }, 300);
  }, 2000);
}

// --- Price Simulation ---
let currentPrice = 0.0001;
function simulatePriceMovement() {
  if (!elements.currentPrice) return;
  
  const change = (Math.random() * 0.00002) - 0.00001;
  currentPrice = Math.max(0.00009, currentPrice + change);
  elements.currentPrice.textContent = currentPrice.toFixed(6);
}
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'primary-green': '#10B981',
        'dark-green': '#059669'
      }
    }
  }
}
