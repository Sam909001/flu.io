// =========================
// GLOBAL VARIABLES
// =========================
let signer = null;
let provider = null;
let userWalletAddress = null;
let tokenChart = null;
let isConnecting = false;
let walletConnectProvider = null;

// Presale configuration
const TOTAL_STAGES = 15;
const STAGE_DURATION = 60 * 1000; // 1 minute per stage
const PRESALE_DURATION = TOTAL_STAGES * STAGE_DURATION; // 15 minutes total

// =========================
// UTILITY FUNCTIONS
// =========================
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isValidAddress(address) {
  return /^(0x)?[0-9a-f]{40}$/i.test(address);
}

function toggleButtonLoading(buttonId, isLoading) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  if (isLoading) {
    button.innerHTML = `<span class="spinner"></span> Processing...`;
    button.disabled = true;
  } else {
    const originalText = buttonId === 'buyButton' ? '🚀 Buy Now' : 
                       buttonId === 'stakeButton' ? 'Stake Now' : 
                       buttonId === 'claimButton' ? 'Claim Tokens' : 
                       'Connect Wallet';
    button.innerHTML = originalText;
    button.disabled = false;
  }
}

function showError(elementId, message) {
  const element = document.getElementById(elementId);
  if (!element) return;
  
  element.textContent = message;
  element.classList.add('show');
  
  setTimeout(() => {
    element.classList.remove('show');
  }, 5000);
}

function showSuccessMessage(message) {
  const element = document.getElementById('successMessage');
  const textElement = document.getElementById('successMessageText');
  
  if (!element || !textElement) return;
  
  textElement.textContent = message;
  element.classList.add('show');
  
  setTimeout(() => {
    element.classList.remove('show');
  }, 5000);
}

function openWalletModal() {
  document.getElementById('walletModal').classList.remove('hidden');
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.add('hidden');
}

// =========================
// WALLET FUNCTIONS
// =========================
async function connectMetaMask() {
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    if (!window.ethereum) {
      // Mobile deep link
      if (isMobile()) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`);
        throw new Error("Please open in MetaMask browser or install MetaMask");
      } else {
        throw new Error('MetaMask not detected. Please install MetaMask browser extension.');
      }
    }

    // Check if already connected
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) {
      userWalletAddress = accounts[0];
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      updateWalletUI();
      return;
    }

    // Request connection
    const newAccounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    }).catch(err => {
      if (err.code === 4001) throw new Error("Connection rejected");
      throw err;
    });

    if (!newAccounts.length) throw new Error("No accounts found");
    
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userWalletAddress = newAccounts[0];
    
    updateWalletUI();
    closeWalletModal();
    showSuccessMessage('Successfully connected to MetaMask!');
    
  } catch (error) {
    console.error('MetaMask connection error:', error);
    showError('walletError', error.message || 'Failed to connect to MetaMask');
  } finally {
    isConnecting = false;
  }
}

async function connectWalletConnect() {
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    // Initialize WalletConnect Provider
    walletConnectProvider = new WalletConnectProvider.default({
      rpc: {
        1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Ethereum Mainnet
        56: "https://bsc-dataseed.binance.org/", // BSC Mainnet
        137: "https://polygon-rpc.com" // Polygon
      },
      chainId: 56, // Default to BSC
      qrcodeModalOptions: {
        mobileLinks: [
          "metamask",
          "trust",
          "rainbow",
          "argent",
          "imtoken",
          "pillar"
        ],
        desktopLinks: ["metamask", "coinbase"]
      }
    });

    // Enable session (triggers QR code modal)
    await walletConnectProvider.enable();
    
    // Create Ethers provider
    provider = new ethers.BrowserProvider(walletConnectProvider);
    signer = await provider.getSigner();
    userWalletAddress = await signer.getAddress();
    
    // Subscribe to events
    walletConnectProvider.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        userWalletAddress = accounts[0];
        updateWalletUI();
      }
    });

    walletConnectProvider.on("chainChanged", (chainId) => {
      console.log("Chain changed:", chainId);
      // Convert hex chainId to decimal
      const decimalChainId = parseInt(chainId, 16);
      if (decimalChainId !== 56) {
        alert("Please switch to Binance Smart Chain (Chain ID: 56)");
      }
    });

    walletConnectProvider.on("disconnect", (code, reason) => {
      console.log("WalletConnect disconnected:", code, reason);
      disconnectWallet();
    });

    updateWalletUI();
    closeWalletModal();
    showSuccessMessage('Successfully connected via WalletConnect!');
    
  } catch (error) {
    console.error('WalletConnect error:', error);
    showError('walletError', error.message || 'Failed to connect via WalletConnect');
  } finally {
    isConnecting = false;
  }
}

async function connectCoinbaseWallet() {
  if (isConnecting) return;
  isConnecting = true;
  
  try {
    if (window.ethereum?.isCoinbaseWallet) {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
      userWalletAddress = accounts[0];
    } else if (isMobile()) {
      // Mobile deep link
      const dappUrl = window.location.href;
      window.open(`https://go.cb-w.com/wallet?dappUrl=${encodeURIComponent(dappUrl)}`, '_blank');
      return;
    } else {
      throw new Error('Coinbase Wallet not detected. Please install Coinbase Wallet extension.');
    }
    
    updateWalletUI();
    closeWalletModal();
    showSuccessMessage('Successfully connected to Coinbase Wallet!');
    
  } catch (error) {
    console.error('Coinbase Wallet connection error:', error);
    showError('walletError', error.message || 'Failed to connect to Coinbase Wallet');
  } finally {
    isConnecting = false;
  }
}

function updateWalletUI() {
  const walletButton = document.getElementById('walletButton');
  const walletAddress = document.getElementById('walletAddress');
  
  if (userWalletAddress) {
    walletButton.textContent = 'Connected ✓';
    walletButton.classList.remove('bg-blue-500');
    walletButton.classList.add('bg-green-600');
    
    walletAddress.textContent = `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
    walletAddress.classList.remove('hidden');
    
    showReferralUI(userWalletAddress);
  }
}

function disconnectWallet() {
  // Disconnect WalletConnect if active
  if (walletConnectProvider) {
    try {
      walletConnectProvider.disconnect();
    } catch (e) {
      console.log("WalletConnect disconnect error:", e);
    }
    walletConnectProvider = null;
  }
  
  // Reset all wallet state
  userWalletAddress = null;
  provider = null;
  signer = null;
  
  // Update UI
  const walletButton = document.getElementById('walletButton');
  const walletAddress = document.getElementById('walletAddress');
  
  walletButton.textContent = 'Connect Wallet';
  walletButton.classList.remove('bg-green-600');
  walletButton.classList.add('bg-blue-500');
  
  walletAddress.classList.add('hidden');
  
  // Reset referral section
  document.getElementById('referralSection').innerHTML = `
    <p class="mb-4">Connect your wallet to access your referral link and start earning!</p>
    <button onclick="connectReferralWallet()" class="btn btn-primary">
      Connect Wallet for Referrals
    </button>
  `;
  
  showSuccessMessage('Wallet disconnected');
}

// =========================
// PRESALE FUNCTIONS
// =========================
function getPresaleStartTime() {
  let startTime = localStorage.getItem('presaleStartTime');
  if (!startTime) {
    startTime = Date.now();
    localStorage.setItem('presaleStartTime', startTime);
  }
  return parseInt(startTime);
}

function resetPresaleTimer() {
  if (confirm("Are you sure you want to reset the presale timer? (Development only)")) {
    localStorage.removeItem('presaleStartTime');
    location.reload();
  }
}

function updateNextIncreaseTime() {
  const now = Date.now();
  const startTime = getPresaleStartTime();
  const nextStageTime = startTime + (Math.floor((now - startTime) / STAGE_DURATION) + 1) * STAGE_DURATION;
  const timeLeft = nextStageTime - now;
  
  const mins = Math.floor(timeLeft / (1000 * 60));
  const secs = Math.floor((timeLeft % (1000 * 60)) / 1000);
  document.getElementById('nextIncreaseTime').textContent = 
    `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimers() {
  const now = Date.now();
  const startTime = getPresaleStartTime();
  const endTime = startTime + PRESALE_DURATION;
  const timeLeft = endTime - now;

  // Calculate stage progress
  const currentStage = Math.min(
    Math.floor((now - startTime) / STAGE_DURATION),
    TOTAL_STAGES - 1
  );
  const stageEndTime = startTime + ((currentStage + 1) * STAGE_DURATION);
  const stageTimeLeft = stageEndTime - now;
  const stageProgress = 1 - (stageTimeLeft / STAGE_DURATION);

  // Update displays
  document.getElementById('current-stage').textContent = currentStage + 1;
  document.getElementById('stageProgressBar').style.width = `${((currentStage + stageProgress) / TOTAL_STAGES) * 100}%`;

  // Update price
  const price = (0.0001 * Math.pow(1.05, currentStage)).toFixed(6);
  document.getElementById('currentPrice').innerHTML = `$${price} <span class="price-tooltip"><i class="fas fa-info-circle text-blue-500"></i><span class="tooltip-text"><strong>Price Increase:</strong><br>+5% per stage (every 1 minute)<br>Next increase: <span id="nextIncreaseTime">00:59</span></span></span>`;

  // Update timers
  if (timeLeft <= 0) {
    document.getElementById('presale-timer').innerHTML = "🎉 Presale Ended!";
    document.getElementById('stage-seconds').textContent = "0";
  } else {
    document.getElementById('presale-minutes').textContent = Math.floor(timeLeft / (1000 * 60)).toString().padStart(2, '0');
    document.getElementById('presale-seconds').textContent = Math.floor((timeLeft % (1000 * 60)) / 1000).toString().padStart(2, '0');
    document.getElementById('stage-seconds').textContent = Math.floor(stageTimeLeft / 1000);
  }
}

// =========================
// TRANSACTION FUNCTIONS
// =========================
async function safeTransaction(operation, params) {
  try {
    toggleButtonLoading(params.buttonId, true);
    const result = await operation();
    return result;
  } catch (error) {
    console.error(`${params.context} Error:`, error);
    
    let userMessage = error.message;
    if (error.code === 4001) userMessage = "Transaction rejected";
    if (error.code === -32603) userMessage = "Network error occurred";
    
    showError(params.errorElementId, `
      ${params.friendlyMessage || "Operation failed"}: 
      ${userMessage}
      ${params.retryHint ? "\n\n" + params.retryHint : ''}
    `);
    
    return null;
  } finally {
    toggleButtonLoading(params.buttonId, false);
  }
}

function validatePurchase(params) {
  if (!userWalletAddress) {
    return { valid: false, message: 'Please connect your wallet first.' };
  }
  
  if (!params.amount || isNaN(params.amount) || Number(params.amount) <= 0) {
    return { valid: false, message: 'Please enter a valid amount.' };
  }
  
  if (params.ref && !isValidAddress(params.ref)) {
    return { valid: false, message: 'Invalid referral address format.' };
  }
  
  return { valid: true };
}

async function mockPurchase(params) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  return {
    success: true,
    amount: params.amount,
    tokens: params.amount * 1000000
  };
}

function updateUIAfterPurchase(result) {
  showSuccessMessage('Purchase successful!');
  const currentSold = parseInt(document.getElementById('tokensSold').textContent.replace(/,/g, ''));
  document.getElementById('tokensSold').textContent = (currentSold + result.tokens).toLocaleString();
}

async function buyFluffi() {
  const params = {
    amount: document.getElementById('amountInput').value,
    currency: document.getElementById('currencySelect').value,
    ref: document.getElementById('refInput').value
  };

  const validation = validatePurchase(params);
  if (!validation.valid) {
    showError('buyError', validation.message);
    return;
  }

  const result = await safeTransaction(
    async () => await mockPurchase(params),
    {
      context: "Token Purchase",
      buttonId: 'buyButton',
      errorElementId: 'buyError',
      friendlyMessage: "Purchase failed",
      retryHint: "Check your balance and try again"
    }
  );

  if (result) {
    updateUIAfterPurchase(result);
  }
}

async function stakeFluffi() {
  const amount = document.getElementById('stakeInput').value;
  
  if (!userWalletAddress) {
    showError('stakeError', 'Please connect your wallet first.');
    return;
  }
  
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    showError('stakeError', 'Please enter a valid amount.');
    return;
  }
  
  await safeTransaction(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    {
      context: "Staking",
      buttonId: 'stakeButton',
      errorElementId: 'stakeError',
      friendlyMessage: "Staking failed",
      retryHint: "Check your token balance and approval"
    }
  );
}

async function claimTokens() {
  if (!userWalletAddress) {
    showError('claimError', 'Please connect your wallet first.');
    return;
  }
  
  await safeTransaction(
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    {
      context: "Claim",
      buttonId: 'claimButton',
      errorElementId: 'claimError',
      friendlyMessage: "Claim failed",
      retryHint: "Try again later"
    }
  );
}

// =========================
// REFERRAL FUNCTIONS
// =========================
async function connectReferralWallet() {
  if (!userWalletAddress) {
    await connectMetaMask();
  }
  
  if (userWalletAddress) {
    showReferralUI(userWalletAddress);
  }
}

function showReferralUI(wallet) {
  const referralLink = `${window.location.href.split('?')[0]}?ref=${wallet}`;
  
  document.getElementById('referralSection').innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block mb-2 font-semibold dark:text-white">Your referral link:</label>
        <div class="flex">
          <input type="text" id="referralLinkInput" 
                 value="${referralLink}" 
                 class="flex-1 p-3 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600" readonly>
          <button onclick="copyReferralLink()" class="btn btn-secondary rounded-l-none">
            Copy
          </button>
        </div>
      </div>
      
      <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <p class="dark:text-gray-300">👥 Total referrals: <span class="font-bold">0</span></p>
        <p class="dark:text-gray-300">💰 Earnings: <span class="font-bold">0 FLUFFI</span></p>
      </div>
      
      <div class="mt-4">
        <p class="text-sm mb-2 font-semibold dark:text-white">Share your link:</p>
        <div class="flex space-x-3">
          <button onclick="shareOnTwitter()" class="btn btn-secondary text-sm">
            🐦 Twitter
          </button>
          <button onclick="shareOnTelegram()" class="btn btn-secondary text-sm">
            📱 Telegram
          </button>
        </div>
      </div>
    </div>
  `;
}

function copyReferralLink() {
  const input = document.getElementById('referralLinkInput');
  input.select();
  document.execCommand('copy');
  showSuccessMessage('Referral link copied to clipboard!');
}

function shareOnTwitter() {
  const link = document.getElementById('referralLinkInput').value;
  window.open(`https://twitter.com/intent/tweet?text=Join%20$FLUFFI%20presale!%20🚀%20Use%20my%20referral%20link%20for%20bonus%20tokens:%20${encodeURIComponent(link)}%20%23FluffiArmy`, '_blank');
}

function shareOnTelegram() {
  const link = encodeURIComponent(document.getElementById('referralLinkInput').value);
  window.open(`https://t.me/share/url?url=${link}&text=Check%20out%20$FLUFFI%20presale%20with%20my%20referral%20link!`, '_blank');
}

// =========================
// CHART INITIALIZATION
// =========================
function initializeChart() {
  const ctx = document.getElementById('tokenChart');
  if (!ctx) return;

  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const chartConfig = {
    type: 'doughnut',
    data: {
      labels: ['Presale (40%)', 'Liquidity (30%)', 'Staking (20%)', 'Marketing (5%)', 'Team (5%)'],
      datasets: [{
        data: [40, 30, 20, 5, 5],
        backgroundColor: [
          '#10B981', // Green
          '#3B82F6', // Blue
          '#F59E0B', // Yellow
          '#EF4444', // Red
          '#8B5CF6'  // Purple
        ],
        borderWidth: 2,
        borderColor: isDarkMode ? '#1f2937' : '#ffffff'
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: isDarkMode ? '#FFFFFF' : '#111827',
            font: {
              size: 14,
              family: "'Inter', sans-serif"
            },
            padding: 20,
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  };

  tokenChart = new Chart(ctx, chartConfig);
}

// =========================
// THEME FUNCTIONS
// =========================
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark'));
  
  if (tokenChart) {
    const isDarkMode = document.documentElement.classList.contains('dark');
    tokenChart.options.plugins.legend.labels.color = isDarkMode ? '#FFFFFF' : '#111827';
    tokenChart.update();
  }
}

// =========================
// INITIALIZATION
// =========================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize dark mode from localStorage
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
  
  // Show wallet modal automatically for mobile if wallet not connected
  if (isMobile() && !userWalletAddress) {
    setTimeout(() => {
      openWalletModal();
    }, 1500); // small delay for better UX
  }

  // Show reset button in development
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    document.getElementById('devResetButton').classList.remove('hidden');
    window._devTools = {
      resetTimer: resetPresaleTimer,
      disconnectWallet: disconnectWallet
    };
    console.log("Dev tools available:");
    console.log("_devTools.resetTimer() - Reset presale timer");
    console.log("_devTools.disconnectWallet() - Disconnect wallet");
  }
  
  // Initialize chart
  initializeChart();
  
  // Start timers
  updateTimers();
  updateNextIncreaseTime();
  setInterval(() => {
    updateTimers();
    updateNextIncreaseTime();
  }, 1000);
  
  // Check for referral in URL
  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref && isValidAddress(ref)) {
    const refInput = document.getElementById('refInput');
    if (refInput) {
      refInput.value = ref;
    }
  }
  
  // Set up event listeners for wallet changes
  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (userWalletAddress && accounts[0] !== userWalletAddress) {
        userWalletAddress = accounts[0];
        updateWalletUI();
      }
    });

    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }
});
