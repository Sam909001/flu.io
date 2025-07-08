// FLUFFI PRESALE MASTER SCRIPT

// =========================
// GLOBAL VARIABLES
// =========================
let signer = null;
let provider = null;
let userWalletAddress = null;
let tokenChart = null;
let isConnecting = false;
let walletConnectProvider = null;

const TOTAL_STAGES = 15;
const STAGE_DURATION = 60 * 1000;
const PRESALE_DURATION = TOTAL_STAGES * STAGE_DURATION;

// =========================
// UTILS
// =========================
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isValidAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

function toggleButtonLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading ? '<span class="spinner"></span> Processing...' :
    id === 'buyButton' ? '🚀 Buy Now' :
    id === 'stakeButton' ? 'Stake Now' :
    id === 'claimButton' ? 'Claim Tokens' :
    'Connect Wallet';
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
  }
}

function showSuccessMessage(msg) {
  const el = document.getElementById('successMessage');
  const textEl = document.getElementById('successMessageText');
  if (el && textEl) {
    textEl.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
  }
}

function openWalletModal() {
  document.getElementById('walletModal').classList.remove('hidden');
}
function closeWalletModal() {
  document.getElementById('walletModal').classList.add('hidden');
}

// =========================
// WALLET CONNECTION
// =========================
async function connectMetaMask() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    if (!window.ethereum) {
      if (isMobile()) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`);
        throw new Error("Please open in MetaMask browser");
      } else {
        throw new Error('MetaMask not found');
      }
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    if (!accounts.length) throw new Error("No accounts found");
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userWalletAddress = accounts[0];
    updateWalletUI();
    closeWalletModal();
    showSuccessMessage('Connected to MetaMask');
  } catch (e) {
    showError('walletError', e.message);
  } finally {
    isConnecting = false;
  }
}

async function connectWalletConnect() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    walletConnectProvider = new WalletConnectProvider.default({
      rpc: {
        56: "https://bsc-dataseed.binance.org/",
        1: "https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
      },
      chainId: 56
    });
    await walletConnectProvider.enable();
    provider = new ethers.BrowserProvider(walletConnectProvider);
    signer = await provider.getSigner();
    userWalletAddress = await signer.getAddress();
    walletConnectProvider.on("disconnect", disconnectWallet);
    updateWalletUI();
    closeWalletModal();
    showSuccessMessage('Connected via WalletConnect');
  } catch (e) {
    showError('walletError', e.message);
  } finally {
    isConnecting = false;
  }
}

function disconnectWallet() {
  if (walletConnectProvider) {
    walletConnectProvider.disconnect();
    walletConnectProvider = null;
  }
  signer = null;
  provider = null;
  userWalletAddress = null;
  document.getElementById('walletButton').textContent = 'Connect Wallet';
  document.getElementById('walletAddress').classList.add('hidden');
  document.getElementById('referralSection').innerHTML = `
    <p class="mb-4">Connect your wallet to access your referral link and start earning!</p>
    <button onclick="connectReferralWallet()" class="btn btn-primary">Connect Wallet for Referrals</button>`;
}

function updateWalletUI() {
  const btn = document.getElementById('walletButton');
  const addr = document.getElementById('walletAddress');
  btn.textContent = 'Connected ✓';
  btn.classList.add('bg-green-600');
  addr.textContent = `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
  addr.classList.remove('hidden');
  showReferralUI(userWalletAddress);
}

// =========================
// PRESALE LOGIC
// =========================
function getPresaleStartTime() {
  let start = localStorage.getItem('presaleStartTime');
  if (!start) {
    start = Date.now();
    localStorage.setItem('presaleStartTime', start);
  }
  return parseInt(start);
}

function updateNextIncreaseTime() {
  const now = Date.now();
  const next = getPresaleStartTime() + (Math.floor((now - getPresaleStartTime()) / STAGE_DURATION) + 1) * STAGE_DURATION;
  const left = next - now;
  const mins = Math.floor(left / 60000);
  const secs = Math.floor((left % 60000) / 1000);
  document.getElementById('nextIncreaseTime').textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function updateTimers() {
  const now = Date.now();
  const start = getPresaleStartTime();
  const end = start + PRESALE_DURATION;
  const left = end - now;
  const currentStage = Math.min(Math.floor((now - start) / STAGE_DURATION), TOTAL_STAGES - 1);
  const stageLeft = start + ((currentStage + 1) * STAGE_DURATION) - now;
  const progress = 1 - (stageLeft / STAGE_DURATION);

  document.getElementById('current-stage').textContent = currentStage + 1;
  document.getElementById('stageProgressBar').style.width = `${((currentStage + progress) / TOTAL_STAGES) * 100}%`;
  document.getElementById('currentPrice').innerHTML = `$${(0.0001 * Math.pow(1.05, currentStage)).toFixed(6)} <span class="price-tooltip"><i class="fas fa-info-circle text-blue-500"></i><span class="tooltip-text"><strong>Price Increase:</strong><br>+5% per stage<br>Next increase: <span id="nextIncreaseTime"></span></span></span>`;

  if (left <= 0) {
    document.getElementById('presale-timer').innerHTML = "🎉 Presale Ended!";
    document.getElementById('stage-seconds').textContent = "0";
  } else {
    document.getElementById('presale-minutes').textContent = Math.floor(left / 60000).toString().padStart(2, '0');
    document.getElementById('presale-seconds').textContent = Math.floor((left % 60000) / 1000).toString().padStart(2, '0');
    document.getElementById('stage-seconds').textContent = Math.floor(stageLeft / 1000);
  }
}

// =========================
// BUY FUNCTION
// =========================
const PRESALE_ADDRESS = "0x60A94bc12d0d4F782Fd597e5E1222247CFb7E297";
const PRESALE_ABI = [
  {
    "inputs": [{"internalType":"address","name":"referrer","type":"address"}],
    "name":"contribute",
    "outputs":[],
    "stateMutability":"payable",
    "type":"function"
  }
];

async function buyFluffi() {
  const amount = document.getElementById('amountInput').value;
  const currency = document.getElementById('currencySelect').value;
  const ref = document.getElementById('refInput').value;
  const errorElement = document.getElementById('buyError');

  if (!signer || !provider || !userWalletAddress) {
    return showError('buyError', 'Please connect your wallet first.');
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return showError('buyError', 'Please enter a valid amount.');
  }

  if (ref && !isValidAddress(ref)) {
    return showError('buyError', 'Invalid referral wallet address.');
  }

  try {
    toggleButtonLoading('buyButton', true);

    const contract = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    const value = ethers.parseEther(amount.toString());

    const tx = await contract.contribute(ref || ethers.ZeroAddress, { value });
    await tx.wait();

    showSuccessMessage('✅ Purchase successful!');
    updateTokensSoldDisplay(Number(amount)); // Optional update
  } catch (error) {
    console.error("Buy Error:", error);
    let message = error?.reason || error?.data?.message || error.message;
    if (message.includes('insufficient funds')) message = "Insufficient BNB in your wallet.";
    showError('buyError', message);
  } finally {
    toggleButtonLoading('buyButton', false);
  }
}

const PRESALE_ADDRESS = "0x60A94bc12d0d4F782Fd597e5E1222247CFb7E297";
const PRESALE_ABI = [
  {
    "inputs": [{"internalType":"address","name":"referrer","type":"address"}],
    "name":"contribute",
    "outputs":[],
    "stateMutability":"payable",
    "type":"function"
  }
];

async function buyFluffi() {
  const amount = document.getElementById('amountInput').value;
  const currency = document.getElementById('currencySelect').value;
  const ref = document.getElementById('refInput').value;
  const errorElement = document.getElementById('buyError');

  if (!signer || !provider || !userWalletAddress) {
    return showError('buyError', 'Please connect your wallet first.');
  }

  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return showError('buyError', 'Please enter a valid amount.');
  }

  if (ref && !isValidAddress(ref)) {
    return showError('buyError', 'Invalid referral wallet address.');
  }

  try {
    toggleButtonLoading('buyButton', true);

    const contract = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    const value = ethers.parseEther(amount.toString());

    const tx = await contract.contribute(ref || ethers.ZeroAddress, { value });
    await tx.wait();

    showSuccessMessage('✅ Purchase successful!');
    updateTokensSoldDisplay(Number(amount)); // Optional update
  } catch (error) {
    console.error("Buy Error:", error);
    let message = error?.reason || error?.data?.message || error.message;
    if (message.includes('insufficient funds')) message = "Insufficient BNB in your wallet.";
    showError('buyError', message);
  } finally {
    toggleButtonLoading('buyButton', false);
  }
}


// =========================
// STAKE / CLAIM / REFERRAL
// =========================
async function stakeFluffi() {
  const amount = parseFloat(document.getElementById('stakeInput').value);
  if (!userWalletAddress) return showError('stakeError', 'Connect your wallet.');
  if (!amount || amount <= 0) return showError('stakeError', 'Enter valid amount.');
  toggleButtonLoading('stakeButton', true);
  await new Promise(r => setTimeout(r, 2000));
  showSuccessMessage('Staked successfully');
  toggleButtonLoading('stakeButton', false);
}

async function claimTokens() {
  if (!userWalletAddress) return showError('claimError', 'Connect your wallet.');
  toggleButtonLoading('claimButton', true);
  await new Promise(r => setTimeout(r, 2000));
  showSuccessMessage('Claimed successfully');
  toggleButtonLoading('claimButton', false);
}

function showReferralUI(wallet) {
  const link = `${window.location.href.split('?')[0]}?ref=${wallet}`;
  document.getElementById('referralSection').innerHTML = `
    <div class="space-y-4">
      <div><label>Your referral link:</label>
        <div class="flex">
          <input type="text" id="referralLinkInput" value="${link}" readonly class="flex-1 p-3 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600">
          <button onclick="copyReferralLink()" class="btn btn-secondary rounded-l-none">Copy</button>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
        <p>👥 Total referrals: <span class="font-bold">0</span></p>
        <p>💰 Earnings: <span class="font-bold">0 FLUFFI</span></p>
      </div>
      <div><p class="text-sm mb-2">Share your link:</p>
        <div class="flex space-x-3">
          <button onclick="shareOnTwitter()" class="btn btn-secondary text-sm">🐦 Twitter</button>
          <button onclick="shareOnTelegram()" class="btn btn-secondary text-sm">📱 Telegram</button>
        </div>
      </div>
    </div>`;
}

function copyReferralLink() {
  const input = document.getElementById('referralLinkInput');
  input.select();
  document.execCommand('copy');
  showSuccessMessage('Referral link copied!');
}
function shareOnTwitter() {
  const link = document.getElementById('referralLinkInput').value;
  window.open(`https://twitter.com/intent/tweet?text=Join%20$FLUFFI%20presale!%20${encodeURIComponent(link)}%20%23FluffiArmy`, '_blank');
}
function shareOnTelegram() {
  const link = encodeURIComponent(document.getElementById('referralLinkInput').value);
  window.open(`https://t.me/share/url?url=${link}&text=Join%20$FLUFFI%20presale%20now!`, '_blank');
}

// =========================
// INITIALIZE
// =========================
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') document.documentElement.classList.add('dark');
  updateTimers(); updateNextIncreaseTime();
  setInterval(() => { updateTimers(); updateNextIncreaseTime(); }, 1000);

  const urlParams = new URLSearchParams(window.location.search);
  const ref = urlParams.get('ref');
  if (ref && isValidAddress(ref)) {
    document.getElementById('refInput').value = ref;
  }

  if (window.ethereum) {
    window.ethereum.on('accountsChanged', (acc) => acc.length === 0 ? disconnectWallet() : (userWalletAddress = acc[0], updateWalletUI()));
    window.ethereum.on('chainChanged', () => window.location.reload());
  }

  if (isMobile() && !userWalletAddress) {
    setTimeout(() => {
      document.getElementById('walletButton').classList.remove('hidden');
      openWalletModal();
    }, 1000);
  }
});
