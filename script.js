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

const PRESALE_ADDRESS = "0x60A94bc12d0d4F782Fd597e5E1222247CFb7E297";
const PRESALE_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "referrer", "type": "address" }],
    "name": "contribute",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
];

// =========================
// UTILITIES
// =========================
function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function isValidAddress(addr) {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

function toggleButtonLoading(id, loading) {
  const btn = document.getElementById(id);
  if (!btn) return;
  btn.disabled = loading;
  btn.innerHTML = loading
    ? '<span class="spinner"></span> Processing...'
    : btn.dataset.originalText || btn.innerText;
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 4000);
}

function showSuccessMessage(msg) {
  const el = document.getElementById("successMessage");
  const textEl = document.getElementById("successMessageText");
  if (el && textEl) {
    textEl.textContent = msg;
    el.classList.add("show");
    setTimeout(() => el.classList.remove("show"), 5000);
  }
}

// =========================
// WALLET CONNECT
// =========================
async function connectMetaMask() {
  try {
    if (!window.ethereum) {
      if (isMobile()) {
        window.open(`https://metamask.app.link/dapp/${window.location.host}`);
        return;
      }
      return showError("walletError", "MetaMask not found");
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
    userWalletAddress = accounts[0];
    updateWalletUI();
    closeWalletModal();
  } catch (err) {
    showError("walletError", err.message);
  }
}

async function connectWalletConnect() {
  try {
    walletConnectProvider = new WalletConnectProvider.default({
      rpc: { 56: "https://bsc-dataseed.binance.org/" },
      chainId: 56
    });
    await walletConnectProvider.enable();
    provider = new ethers.BrowserProvider(walletConnectProvider);
    signer = await provider.getSigner();
    userWalletAddress = await signer.getAddress();
    walletConnectProvider.on("disconnect", disconnectWallet);
    updateWalletUI();
    closeWalletModal();
  } catch (err) {
    showError("walletError", err.message);
  }
}

function updateWalletUI() {
  const btn = document.getElementById("walletButton");
  const addr = document.getElementById("walletAddress");
  btn.textContent = "Connected ✓";
  addr.textContent = `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
  addr.classList.remove("hidden");
  showReferralUI(userWalletAddress);
}

function disconnectWallet() {
  if (walletConnectProvider) walletConnectProvider.disconnect();
  signer = provider = userWalletAddress = walletConnectProvider = null;
  document.getElementById("walletButton").textContent = "Connect Wallet";
  document.getElementById("walletAddress").classList.add("hidden");
}

function openWalletModal() {
  document.getElementById("walletModal").classList.remove("hidden");
}
function closeWalletModal() {
  document.getElementById("walletModal").classList.add("hidden");
}

// =========================
// BUY FUNCTION
// =========================
async function buyFluffi() {
  const amount = document.getElementById("amountInput").value;
  const ref = document.getElementById("refInput").value || ethers.ZeroAddress;
  if (!signer) return showError("buyError", "Connect wallet first");
  if (!amount || isNaN(amount) || Number(amount) <= 0) return showError("buyError", "Enter valid amount");
  if (ref && !isValidAddress(ref)) return showError("buyError", "Invalid referral");
  try {
    toggleButtonLoading("buyButton", true);
    const contract = new ethers.Contract(PRESALE_ADDRESS, PRESALE_ABI, signer);
    const value = ethers.parseEther(amount.toString());
    const tx = await contract.contribute(ref, { value });
    await tx.wait();
    showSuccessMessage("✅ Purchase successful!");
  } catch (err) {
    showError("buyError", err?.message || "Transaction failed");
  } finally {
    toggleButtonLoading("buyButton", false);
  }
}

// =========================
// STAKING & CLAIM (mock)
// =========================
async function stakeFluffi() {
  const amount = document.getElementById("stakeInput").value;
  if (!signer) return showError("stakeError", "Connect wallet first");
  if (!amount || Number(amount) <= 0) return showError("stakeError", "Enter valid amount");
  toggleButtonLoading("stakeButton", true);
  await new Promise(r => setTimeout(r, 1500));
  showSuccessMessage("Staked successfully (mock)");
  toggleButtonLoading("stakeButton", false);
}

async function claimTokens() {
  if (!signer) return showError("claimError", "Connect wallet first");
  toggleButtonLoading("claimButton", true);
  await new Promise(r => setTimeout(r, 1500));
  showSuccessMessage("Claimed successfully (mock)");
  toggleButtonLoading("claimButton", false);
}

// =========================
// REFERRALS
// =========================
function showReferralUI(wallet) {
  const link = `${window.location.href.split('?')[0]}?ref=${wallet}`;
  document.getElementById("referralSection").innerHTML = `
    <div class="space-y-3">
      <label>Your Referral Link:</label>
      <div class="flex">
        <input id="referralLinkInput" class="flex-1 p-2 border rounded-l" readonly value="${link}" />
        <button onclick="copyReferralLink()" class="btn btn-secondary rounded-r">Copy</button>
      </div>
    </div>`;
}

function copyReferralLink() {
  const input = document.getElementById("referralLinkInput");
  input.select();
  document.execCommand("copy");
  showSuccessMessage("Referral copied to clipboard");
}

// =========================
// DARK MODE
// =========================
function toggleDarkMode() {
  document.documentElement.classList.toggle("dark");
  localStorage.setItem("darkMode", document.documentElement.classList.contains("dark"));
  if (tokenChart) tokenChart.update();
}

// =========================
// TOKENOMICS CHART
// =========================
function initializeChart() {
  const ctx = document.getElementById("tokenChart");
  if (!ctx) return;
  const dark = document.documentElement.classList.contains("dark");
  tokenChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Presale", "Liquidity", "Staking", "Marketing", "Team"],
      datasets: [{
        data: [40, 30, 20, 5, 5],
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"],
        borderColor: dark ? "#1f2937" : "#fff",
        borderWidth: 2
      }]
    },
    options: {
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: dark ? "#fff" : "#111"
          }
        }
      }
    }
  });
}

// =========================
// TIMER + INIT
// =========================
function updatePresaleUI() {
  const now = Date.now();
  const start = parseInt(localStorage.getItem("presaleStartTime")) || Date.now();
  localStorage.setItem("presaleStartTime", start);
  const elapsed = now - start;
  const stage = Math.min(Math.floor(elapsed / STAGE_DURATION), TOTAL_STAGES - 1);
  const stageEnd = start + (stage + 1) * STAGE_DURATION;
  const timeLeft = stageEnd - now;
  document.getElementById("current-stage").textContent = stage + 1;
  document.getElementById("stageProgressBar").style.width = `${((stage + 1) / TOTAL_STAGES) * 100}%`;
  document.getElementById("currentPrice").innerHTML = `$${(0.0001 * Math.pow(1.05, stage)).toFixed(6)}`;
  document.getElementById("presale-minutes").textContent = Math.floor(timeLeft / 60000).toString().padStart(2, '0');
  document.getElementById("presale-seconds").textContent = Math.floor((timeLeft % 60000) / 1000).toString().padStart(2, '0');
}

document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("darkMode") === "true") document.documentElement.classList.add("dark");
  updatePresaleUI();
  initializeChart();
  setInterval(updatePresaleUI, 1000);
  const ref = new URLSearchParams(window.location.search).get("ref");
  if (ref && isValidAddress(ref)) document.getElementById("refInput").value = ref;
});
