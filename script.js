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
  try {
    // 1. Check if MetaMask is installed
    if (!window.ethereum) {
      alert("Please install MetaMask!");
      return;
    }

    // 2. Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userWalletAddress = accounts[0];
    
    // 3. Check if on BSC (Mainnet or Testnet)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== "0x38" && chainId !== "0x61") { 
      // 4. Switch to BSC Mainnet if on wrong network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x38' }], // BSC Mainnet
      });
    }

    // 5. Update UI
    document.getElementById('walletButton').textContent = "Connected";
    document.getElementById('walletButton').style.backgroundColor = "#4CAF50";
    
  } catch (error) {
    console.error("Connection failed:", error);
    alert(`Error: ${error.message}`);
  }
}

async function updateNetworkStatus() {
  if (!window.ethereum) return;
  
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  let networkName;
  
  switch (chainId) {
    case "0x38": networkName = "BSC Mainnet"; break;
    case "0x61": networkName = "BSC Testnet"; break;
    default: networkName = "Wrong Network";
  }
  
  document.getElementById('network-status').textContent = `Network: ${networkName}`;
}

// Call this when wallet connects
window.ethereum?.on('chainChanged', updateNetworkStatus);

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
  try {
    // 1. Validate inputs
    const amount = document.getElementById('amountInput').value;
    if (!amount || isNaN(amount)) {
      alert("Enter a valid amount!");
      return;
    }

    // 2. Check wallet connection
    if (!userWalletAddress) {
      await connectWallet(); // Auto-connect if not already
      return;
    }

    // 3. Check network (BSC Mainnet/Testnet)
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== "0x38" && chainId !== "0x61") {
      alert("Please switch to Binance Smart Chain (BSC)!");
      return;
    }

    // 4. Initialize ethers.js
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractAbi, signer);

    // 5. Send transaction (with gas limit)
    const tx = await contract.contribute("0xREFERRAL_ADDRESS", {
      value: ethers.utils.parseEther(amount),
      gasLimit: 300000, // Prevents "out of gas" errors
    });

    // 6. Show success message
    alert(`Success! TX Hash: ${tx.hash}`);
    console.log("Transaction:", tx);

  } catch (error) {
    console.error("Buy failed:", error);
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
// --- Stage & Price Logic ---
const TOTAL_STAGES = 15;
const STAGE_DURATION = 24 * 60 * 60; // 24h in seconds

// Load or initialize timer state
const savedState = JSON.parse(localStorage.getItem('fluffiTimer')) || {
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
