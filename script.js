// =========================
// FLUFFI Token Script v2
// Modular, Clean, and Maintained
// =========================

// Global State
let signer = null;
let provider = null;
let userWalletAddress = null;
let tokenChart = null;
let isConnecting = false;
let walletConnectProvider = null;

// Presale Config
const TOTAL_STAGES = 15;
const STAGE_DURATION = 60 * 1000;
const PRESALE_DURATION = TOTAL_STAGES * STAGE_DURATION;

// Utility
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function showError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = message;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 5000);
  }
}

function showSuccess(msg) {
  const box = document.getElementById('successMessage');
  const text = document.getElementById('successMessageText');
  if (box && text) {
    text.textContent = msg;
    box.classList.add('show');
    setTimeout(() => box.classList.remove('show'), 5000);
  }
}

function toggleLoading(btnId, isLoading, defaultLabel) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.innerHTML = isLoading ? `<span class="spinner"></span> Processing...` : defaultLabel;
  btn.disabled = isLoading;
}

// =========================
// WALLET CONNECTIONS
// =========================
async function connectMetaMask() {
  if (isConnecting) return;
  isConnecting = true;
  try {
    if (!window.ethereum) {
      if (isMobile()) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`);
        return;
      }
      throw new Error("MetaMask not detected");
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userWalletAddress = accounts[0];
    updateWalletUI();
    showSuccess("Connected to MetaMask");
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
      rpc: { 56: "https://bsc-dataseed.binance.org/" },
      chainId: 56,
    });
    await walletConnectProvider.enable();
    provider = new ethers.BrowserProvider(walletConnectProvider);
    signer = await provider.getSigner();
    userWalletAddress = await signer.getAddress();
    updateWalletUI();
    showSuccess("Connected via WalletConnect");
  } catch (e) {
    showError('walletError', e.message);
  } finally {
    isConnecting = false;
  }
}

function updateWalletUI() {
  const btn = document.getElementById('walletButton');
  const addr = document.getElementById('walletAddress');
  if (userWalletAddress) {
    btn.textContent = 'Connected ✓';
    addr.textContent = `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
    addr.classList.remove('hidden');
    setupReferral(userWalletAddress);
  }
}

// =========================
// PRESALE TIMER
// =========================
function getPresaleStart() {
  let t = localStorage.getItem('presaleStartTime');
  if (!t) {
    t = Date.now();
    localStorage.setItem('presaleStartTime', t);
  }
  return parseInt(t);
}

function updateTimers() {
  const now = Date.now();
  const start = getPresaleStart();
  const end = start + PRESALE_DURATION;
  const remaining = end - now;

  const stage = Math.min(Math.floor((now - start) / STAGE_DURATION), TOTAL_STAGES - 1);
  const nextTime = start + (stage + 1) * STAGE_DURATION;
  const stageLeft = nextTime - now;
  const progress = 1 - stageLeft / STAGE_DURATION;

  document.getElementById('current-stage').textContent = stage + 1;
  document.getElementById('stageProgressBar').style.width = `${((stage + progress) / TOTAL_STAGES) * 100}%`;
  document.getElementById('presale-minutes').textContent = String(Math.floor(remaining / 60000)).padStart(2, '0');
  document.getElementById('presale-seconds').textContent = String(Math.floor((remaining % 60000) / 1000)).padStart(2, '0');
  document.getElementById('stage-seconds').textContent = Math.floor(stageLeft / 1000);

  const price = (0.0001 * Math.pow(1.05, stage)).toFixed(6);
  document.getElementById('currentPrice').innerHTML = `$${price} <span class="price-tooltip"><i class="fas fa-info-circle text-blue-500"></i><span class="tooltip-text">+5% every 1 min</span></span>`;
}

// =========================
// REFERRAL SYSTEM
// =========================
function setupReferral(wallet) {
  const link = `${window.location.origin}${window.location.pathname}?ref=${wallet}`;
  document.getElementById('referralSection').innerHTML = `
    <div>
      <label>Your referral link:</label>
      <input type="text" value="${link}" readonly id="referralLinkInput" class="w-full mb-2" />
      <button onclick="copyReferralLink()" class="btn btn-secondary">Copy</button>
    </div>`;
}

function copyReferralLink() {
  const el = document.getElementById('referralLinkInput');
  el.select();
  document.execCommand('copy');
  showSuccess("Referral link copied!");
}

// =========================
// STAKING & CLAIM PLACEHOLDERS
// =========================
async function stakeFluffi() {
  if (!userWalletAddress) return showError('stakeError', 'Connect wallet');
  const val = document.getElementById('stakeInput').value;
  if (!val || val <= 0) return showError('stakeError', 'Enter valid amount');
  toggleLoading('stakeButton', true, 'Stake Now');
  await new Promise(r => setTimeout(r, 2000));
  toggleLoading('stakeButton', false, 'Stake Now');
  showSuccess('Staked successfully');
}

async function claimTokens() {
  if (!userWalletAddress) return showError('claimError', 'Connect wallet');
  toggleLoading('claimButton', true, 'Claim Tokens');
  await new Promise(r => setTimeout(r, 2000));
  toggleLoading('claimButton', false, 'Claim Tokens');
  showSuccess('Tokens claimed');
}

// =========================
// INIT
// =========================
document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark');
  }
  updateTimers();
  setInterval(updateTimers, 1000);
  const ref = new URLSearchParams(window.location.search).get('ref');
  if (ref) document.getElementById('refInput').value = ref;
});
