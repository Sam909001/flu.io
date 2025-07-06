// --- Global State ---
let userWallet = null;
let walletConnectProvider = null;
let isConnecting = false;
const leaderboard = JSON.parse(localStorage.getItem('fluffiLeaderboard')) || {};
const initialPrice = 0.0001;
const TOTAL_STAGES = 15;
const STAGE_DURATION = 60 * 1000; // 1 minute in ms for test

// --- DOM Elements ---
const elements = {
  walletButton: document.getElementById('walletButton'),
  amountInput: document.getElementById('amountInput'),
  stakeInput: document.getElementById('stakeInput'),
  refInput: document.getElementById('refInput'),
  currentPrice: document.getElementById('currentPrice'),
  priceInfo: document.getElementById('priceInfo'),
  countdown: document.getElementById('countdown'),
  leaderboard: document.getElementById('leaderboard'),
  referralSection: document.getElementById('referralSection'),
  progressFill: document.getElementById('progressFill'),
  stagePercent: document.getElementById('stage-percentage'),
  currentStage: document.getElementById('current-stage'),
  stageHours: document.getElementById('stage-hours'),
  stageMinutes: document.getElementById('stage-minutes'),
  stageSeconds: document.getElementById('stage-seconds'),
  presaleDays: document.getElementById('presale-days'),
  presaleHours: document.getElementById('presale-hours'),
  presaleMinutes: document.getElementById('presale-minutes'),
  presaleSeconds: document.getElementById('presale-seconds')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initReferralSystem();
  startTokenCounter();
  renderLeaderboard();
  startCountdown();
  setInterval(simulatePriceMovement, 5000);
  
  // Initialize wallet listeners
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  }
});

// --- Wallet Connection ---
async function connectWallet() {
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.disabled = true;
      btn.textContent = "Connecting...";
    });

    // Try MetaMask first
    if (window.ethereum) {
      await connectMetaMask();
    } else {
      // Fallback to WalletConnect
      await connectWalletConnect();
    }
  } catch (error) {
    console.error('Connection error:', error);
    alert(`Error: ${error.message}`);
    resetWalletButtons();
  } finally {
    isConnecting = false;
  }
}

async function connectMetaMask() {
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  userWallet = accounts[0];
  updateWalletUI();
}

async function connectWalletConnect() {
  // Initialize WalletConnect Provider
  walletConnectProvider = new WalletConnectProvider.default({
    rpc: {
      1: "https://mainnet.infura.io/v3/f09a42b35c814e08ad7e92837f8db27f",
      56: "https://bsc-dataseed.binance.org/",
      137: "https://polygon-rpc.com/"
    },
    chainId: 56, // Default to BSC
    qrcodeModalOptions: {
      mobileLinks: ["metamask", "trust", "rainbow", "argent", "coinbase"],
      desktopLinks: ["metamask", "coinbase"]
    }
  });

  // Handle mobile deep linking
  if (isMobile()) {
    walletConnectProvider.connector.on("display_uri", (err, payload) => {
      const uri = payload.params[0];
      // Try to open directly in mobile wallet
      if (navigator.userAgent.match(/Trust/i)) {
        window.open(`https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`);
      } else if (navigator.userAgent.match(/MetaMaskMobile/i)) {
        window.open(`https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}`);
      }
    });
  }

  await walletConnectProvider.enable();
  
  // Create Ethers provider
  const provider = new ethers.BrowserProvider(walletConnectProvider);
  const signer = await provider.getSigner();
  userWallet = await signer.getAddress();

  // Set up event listeners
  walletConnectProvider.on("accountsChanged", handleAccountsChanged);
  walletConnectProvider.on("disconnect", disconnectWallet);

  updateWalletUI();
}

function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    disconnectWallet();
  } else {
    userWallet = accounts[0];
    updateWalletUI();
  }
}

function disconnectWallet() {
  if (walletConnectProvider) {
    walletConnectProvider.disconnect();
    walletConnectProvider = null;
  }
  userWallet = null;
  resetWalletButtons();
}

function updateWalletUI() {
  if (!userWallet) return;
  
  document.querySelectorAll('[id*="connect"]').forEach(btn => {
    btn.textContent = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;
    btn.disabled = false;
  });

  if (elements.referralSection) generateReferralUI();
}

function resetWalletButtons() {
  document.querySelectorAll('[id*="connect"]').forEach(btn => {
    btn.disabled = false;
    btn.textContent = "Connect Wallet";
  });
}

// --- Referral System (keep existing implementation) ---
function initReferralSystem() {
  const refCode = new URLSearchParams(window.location.search).get('ref');
  if (refCode && /^0x[a-fA-F0-9]{40}$/.test(refCode)) {
    localStorage.setItem('fluffiRef', refCode);
  }
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
          <input type="text" id="userReferralLink" value="${window.location.origin}?ref=${userWallet}" class="flex-1 p-2 border rounded-l dark:bg-gray-700" readonly>
          <button onclick="copyReferralLink()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r">Copy</button>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded">
        <p>Total referrals: <span id="referralCount">${leaderboard[userWallet]?.toFixed(2) || 0}</span></p>
        <p>Earnings: <span id="referralEarnings">${(leaderboard[userWallet] * 0.1)?.toFixed(2) || 0} FLUFFI</span></p>
      </div>
    </div>`;
}

function copyReferralLink() {
  const input = document.getElementById('userReferralLink');
  input.select();
  document.execCommand('copy');
  const btn = input.nextElementSibling;
  btn.textContent = 'Copied!';
  setTimeout(() => btn.textContent = 'Copy', 2000);
}

// --- Buy ---
async function buyFluffi() {
  if (!userWallet) return alert('Please connect wallet first');
  const amount = parseFloat(elements.amountInput.value);
  if (isNaN(amount) || amount <= 0) return alert('Enter valid amount');

  const ref = localStorage.getItem('fluffiRef') || elements.refInput?.value;
  if (ref && ref !== userWallet) {
    const reward = amount * 0.1;
    leaderboard[ref] = (leaderboard[ref] || 0) + reward;
    localStorage.setItem('fluffiLeaderboard', JSON.stringify(leaderboard));
    alert(`Success! Referrer earned $${reward.toFixed(2)}`);
  } else {
    alert('Purchase successful!');
  }

  renderLeaderboard();
  if (elements.referralSection) generateReferralUI();
}

// --- Leaderboard ---
function renderLeaderboard() {
  if (!elements.leaderboard) return;
  const sorted = Object.entries(leaderboard).sort((a, b) => b[1] - a[1]).slice(0, 5);
  elements.leaderboard.innerHTML = `
    <h3 class="text-lg font-bold mb-2">Top Referrers</h3>
    ${sorted.length ? sorted.map(([addr, amt], i) =>
      `<p class="text-sm">${i + 1}. ${addr.slice(0, 6)}...${addr.slice(-4)} - $${amt.toFixed(2)}</p>`
    ).join('') : '<p class="text-sm text-gray-500">No referrals yet</p>'}`;
}

// --- Countdown & Stage Logic ---
function startCountdown() {
  const startTime = getPresaleStartTime();
  setInterval(() => updatePresaleUI(startTime), 1000);
}

function getPresaleStartTime() {
  let stored = localStorage.getItem('presaleStartTime');
  if (!stored) {
    stored = Date.now();
    localStorage.setItem('presaleStartTime', stored);
  }
  return parseInt(stored);
}
  // Inside updateTimers() function, add
  function updateNextIncreaseTime() {
    const now = Date.now();
    const startTime = getPresaleStartTime();
    const nextStageTime = startTime + (Math.floor((now - startTime) / STAGE_DURATION) + 1) * STAGE_DURATION;
    const timeLeft = nextStageTime - now;
    
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    document.getElementById('nextIncreaseTime').textContent = 
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Modify your setInterval to:
  setInterval(() => {
    updateTimers();
    updateNextIncreaseTime(); // Add this line
  }, 1000);

function updatePresaleUI(startTime) {
  const now = Date.now();
  const endTime = startTime + (TOTAL_STAGES * STAGE_DURATION);
  const timeLeft = endTime - now;

  // Presale timer
  if (timeLeft <= 0) {
    document.getElementById('presale-timer').textContent = "🎉 Presale Ended!";
    return;
  }
  const d = timeLeft / (1000 * 60 * 60 * 24);
  const h = (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
  const m = (timeLeft % (1000 * 60 * 60)) / (1000 * 60);
  const s = (timeLeft % (1000 * 60)) / 1000;
  elements.presaleDays.textContent = format(d);
  elements.presaleHours.textContent = format(h);
  elements.presaleMinutes.textContent = format(m);
  elements.presaleSeconds.textContent = format(s);

  // Stage & Progress
  const current = Math.min(Math.floor((now - startTime) / STAGE_DURATION), TOTAL_STAGES - 1);
  const stageEnd = startTime + (current + 1) * STAGE_DURATION;
  const stageLeft = stageEnd - now;

  elements.currentStage.textContent = current + 1;

  elements.currentStage.textContent = current + 1;
  elements.progressFill.style.width = `${((current + 1) / TOTAL_STAGES * 100).toFixed(0)}%`;
  if (elements.stagePercent) elements.stagePercent.textContent = `${((current + 1) / TOTAL_STAGES * 100).toFixed(0)}%`;

  const sh = stageLeft / (1000 * 60 * 60);
  const sm = (stageLeft % (1000 * 60 * 60)) / (1000 * 60);
  const ss = (stageLeft % (1000 * 60)) / 1000;
  elements.stageHours.textContent = format(sh);
  elements.stageMinutes.textContent = format(sm);
  elements.stageSeconds.textContent = format(ss);

  // Price
  const price = (initialPrice * Math.pow(1.05, current)).toFixed(6);
  if (elements.currentPrice) elements.currentPrice.textContent = `$${price}`;
  if (elements.priceInfo) elements.priceInfo.textContent = `Price: $${price}`;
}

function format(num) {
  return String(Math.floor(num)).padStart(2, '0');
}

// --- Token Counter ---
function startTokenCounter() {
  const counter = document.getElementById('tokensSold');
  if (!counter) return;
  let count = 8421509;
  setInterval(() => {
    count += Math.floor(Math.random() * 500) + 100;
    counter.textContent = count.toLocaleString();
    counter.classList.add('text-green-500', 'scale-110');
    setTimeout(() => counter.classList.remove('text-green-500', 'scale-110'), 300);
  }, 2000);
}

// --- Price Movement ---
let currentPrice = 0.0001;
function simulatePriceMovement() {
  if (!elements.currentPrice) return;
  const change = (Math.random() * 0.00002) - 0.00001;
  currentPrice = Math.max(0.00009, currentPrice + change);
  elements.currentPrice.textContent = currentPrice.toFixed(6);
}
function isMobile() {
  return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}
