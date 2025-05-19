// --- Referral Tracking ---
const urlParams = new URLSearchParams(window.location.search);
const refWallet = urlParams.get('ref');
if (refWallet) {
  localStorage.setItem('fluffiRef', refWallet);
}

// --- Simulated Leaderboard Data ---
let leaderboard = JSON.parse(localStorage.getItem('fluffiLeaderboard')) || {};

// --- Buy Function With Referral ---
function buyFluffi() {
  const amount = parseFloat(document.getElementById('amountInput').value);
  const ref = localStorage.getItem('fluffiRef');

  if (!userWalletAddress) {
    alert('Please connect your wallet first.');
    return;
  }

  if (isNaN(amount) || amount <= 0) {
    alert('Please enter a valid amount.');
    return;
  }

  // Simulated Referral Reward
  if (ref && ref !== userWalletAddress) {
    const reward = amount * 0.10; // 10% bonus to referrer
    leaderboard[ref] = (leaderboard[ref] || 0) + reward;
    localStorage.setItem('fluffiLeaderboard', JSON.stringify(leaderboard));
    alert(`You are buying $${amount} of FLUFFI. Referrer ${ref} earns $${reward.toFixed(2)} bonus.`);
  } else {
    alert(`You are buying $${amount} of FLUFFI.`);
  }
}

// --- Render Leaderboard ---
function renderLeaderboard() {
  const container = document.getElementById('leaderboard');
  container.innerHTML = '<h3 class="text-lg font-bold mb-2">Top Referrers</h3>';
  const sorted = Object.entries(leaderboard)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML += '<p class="text-sm text-gray-500">No referrals yet.</p>';
  } else {
    sorted.forEach(([address, amount], index) => {
      container.innerHTML += `<p class="text-sm">${index + 1}. ${address} - $${amount.toFixed(2)}</p>`;
    });
  }
}

document.addEventListener('DOMContentLoaded', renderLeaderboard);
<script>
  let userWalletAddress = null;
  const initialPrice = 0.0001;
  const stages = 15;
  const stageDuration = 1000 * 60 * 60 * 48;
// Example: Fixed start date (e.g. May 5, 2025, at 12:00 UTC)
const startTime = new Date("2025-05-05T12:00:00Z").getTime();

  function updateStage() {
    const now = Date.now();
    const elapsed = now - startTime;
    const stage = Math.min(Math.floor(elapsed / stageDuration), stages - 1);
    const price = (initialPrice * Math.pow(1.05, stage)).toFixed(6);
    document.getElementById('stageInfo').textContent = `Stage: ${stage + 1} / ${stages}`;
    document.getElementById('priceInfo').textContent = `Price: $${price}`;
  }

  function updateCountdown() {
    const end = startTime + 30 * 24 * 60 * 60 * 1000;
    const left = end - Date.now();
    const days = Math.floor(left / (1000 * 60 * 60 * 24));
    const hours = Math.floor((left / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((left / (1000 * 60)) % 60);
    const seconds = Math.floor((left / 1000) % 60);
    document.getElementById('countdown').textContent = `Ends in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  async function connectWallet() {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        userWalletAddress = accounts[0];
        document.getElementById('walletButton').textContent = 'Connected';
      } catch (error) {
        alert('Wallet connection denied.');
      }
    } else {
      alert('MetaMask not detected.');
    }
  }

  function buyFluffi() {
    const amount = document.getElementById('amountInput').value;
    const ref = document.getElementById('refInput').value || localStorage.getItem('referrer') || 'none';
    if (!userWalletAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    alert(`Buying $FLUFFI worth $${amount} with referral: ${ref}`);
  }

  function stakeFluffi() {
    const amount = document.getElementById('stakeInput').value;
    if (!userWalletAddress) {
      alert('Please connect your wallet first.');
      return;
    }
    alert(`Staking ${amount} $FLUFFI with 90% APY`);
  }

  function toggleDarkMode() {
    document.documentElement.classList.toggle('dark');
  }

  // --- Referral Logic ---
  function getReferrerFromURL() {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('referrer', ref);
    }
  }

  function applyReferralField() {
    const savedRef = localStorage.getItem('referrer');
    if (savedRef) {
      const refInput = document.getElementById('refInput');
      if (refInput) {
        refInput.value = savedRef;
      }
    }
  }

  // Initial setup
  getReferrerFromURL();
  applyReferralField();
  updateStage();
  updateCountdown();
  setInterval(() => {
    updateStage();
    updateCountdown();
  }, 1000);
// Progress Bar Animation
function updateProgress() {
  const progressPercent = (currentStage / stages) * 100;
  const progressBar = document.getElementById('progressBar');
  
  // Animate width
  progressBar.style.width = `${progressPercent}%`;
  
  // Change color at thresholds
  if (progressPercent >= 50) {
    progressBar.className = 'bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full transition-all duration-1000 ease-out';
  }
  if (progressPercent >= 90) {
    progressBar.className = 'bg-gradient-to-r from-red-400 to-red-600 h-2.5 rounded-full transition-all duration-1000 ease-out';
  }
}

// Modify your existing countdown function:
function startCountdown() {
  const endTime = startTime + (stageDuration * stages);
  
  function update() {
    const now = Date.now();
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      document.getElementById('countdown').textContent = "Presale completed!";
      return;
    }
    
    // Update progress bar
    updateProgress();
    
    // Existing countdown logic
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    document.getElementById('countdown').textContent = 
      `${
        // Live Token Counter Simulation
function startTokenCounter() {
  const counter = document.getElementById('tokensSold');
  let count = 8421509; // Starting value
  
  // Update every 2 seconds with random increment
  setInterval(() => {
    const increment = Math.floor(Math.random() * 500) + 100;
    count += increment;
    counter.textContent = count.toLocaleString();
    
    // Add visual feedback on update
    counter.classList.add('scale-110', 'text-green-500');
    setTimeout(() => {
      counter.classList.remove('scale-110', 'text-green-500');
    }, 300);
  }, 2000);
}

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  startTokenCounter();
  // Your other init code...
});
</script>

        
// Generate referral link from wallet address
function generateReferralLink(address) {
  const baseUrl = window.location.href.split('?')[0];
  return `${baseUrl}?ref=${address}`;
}

// Check for referral parameter on page load
function checkReferral() {
  const urlParams = new URLSearchParams(window.location.search);
  const refAddress = urlParams.get('ref');
  
  if (refAddress && /^0x[a-fA-F0-9]{40}$/.test(refAddress)) {
    localStorage.setItem('fluffiReferrer', refAddress);
    alert(`You're joining via ${refAddress}'s referral!`);
  }
}

// Copy to clipboard
function copyReferralLink() {
  const linkInput = document.getElementById('referralLink');
  linkInput.select();
  document.execCommand('copy');
  alert('Copied: ' + linkInput.value);
}

// Modified connectWallet()
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userWalletAddress = accounts[0];
      
      // Update UI
      document.getElementById('walletButton').textContent = 'Connected';
      document.getElementById('referralDisconnected').classList.add('hidden');
      document.getElementById('referralConnected').classList.remove('hidden');
      
      // Generate and display referral link
      const referralLink = generateReferralLink(userWalletAddress);
      document.getElementById('referralLink').value = referralLink;
      
    } catch (error) {
      alert('Wallet connection error: ' + error.message);
    }
  } else {
    alert('Please install MetaMask!');
  }
}

// Modified buyFluffi() to handle referrals
async function buyFluffi() {
  if (!userWalletAddress) {
    alert('Please connect wallet first');
    return;
  }

  const amount = document.getElementById('amountInput').value;
  if (!amount || isNaN(amount)) {
    alert('Invalid amount');
    return;
  }

  // Get referrer from localStorage
  const referrer = localStorage.getItem('fluffiReferrer') || '0x0000000000000000000000000000000000000000';

  try {
    const tx = await contract.contribute(referrer, { 
      value: ethers.utils.parseEther(amount) 
    });
    
    alert(`Success! TX: ${tx.hash}`);
  } catch (err) {
    alert('Error: ' + (err.message || err));
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  checkReferral();
});
alert("Transaction sent! Please wait for confirmation...");
await tx.wait();
alert("✅ Purchase successful!");

// Example: show progress based on totalRaised
const raised = await contract.totalRaised();
const progress = (raised / goal) * 100;
document.getElementById('progressBar').style.width = `${progress}%`;

async function buyFluffi() {
  const buyBtn = document.querySelector('button[onclick="buyFluffi()"]');
  try {
    buyBtn.disabled = true;
    buyBtn.textContent = 'Processing...';
    
    // ... existing contract code ...
    
    // Add referral tracking
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');
    const refAddr = refParam || document.getElementById('refInput').value || ethers.constants.AddressZero;
    
    await contract.contribute(refAddr, { 
      value: ethers.utils.parseEther(amount) 
    });
    
  } finally {
    buyBtn.disabled = false;
    buyBtn.textContent = 'Buy Now';
  }
}

// Add contract validation
let contract;
async function initContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  try {
    const code = await provider.getCode(contractAddress);
    if (code === '0x') throw new Error('Contract not deployed');
    contract = new ethers.Contract(contractAddress, contractAbi, provider.getSigner());
  } catch (err) {
    alert('Contract error: ' + err.message);
  }
}

// Poll for contract updates
setInterval(async () => {
  if (contract && userWalletAddress) {
    const earned = await contract.referralEarnings(userWalletAddress);
    document.getElementById('refEarnings').textContent = 
      ethers.utils.formatEther(earned) + ' FLUFFI';
  }
}, 30000);

// Wrap contract calls with better errors
async function safeContractCall(fn, args) {
  try {
    return await fn(...args);
  } catch (err) {
    if (err.code === 'CALL_EXCEPTION') {
      throw new Error('Transaction reverted - check gas limit');
    }
    throw err;
  }
}

// Track referrals in localStorage
if (window.location.search.includes('ref=')) {
  localStorage.setItem('lastReferrer', 
    new URLSearchParams(window.location.search).get('ref'));
}

// Add to your existing script
document.getElementById('connectReferralButton').addEventListener('click', connectWalletForReferrals);

async function connectWalletForReferrals() {
  if (window.ethereum) {
    try {
      const connectBtn = document.getElementById('connectReferralButton');
      connectBtn.disabled = true;
      connectBtn.textContent = "Connecting...";
      
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userWallet = accounts[0];
      
      // Update both connect buttons if they exist
      if (connectBtn) connectBtn.textContent = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;
      if (connectButton) connectButton.textContent = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;
      
      // Show referral UI
      referralSection.innerHTML = `
        <div class="space-y-4">
          <div>
            <label class="block mb-2">Your referral link:</label>
            <div class="flex">
              <input type="text" id="userReferralLink" 
                     value="${window.location.origin}?ref=${userWallet}" 
                     class="flex-1 p-2 border rounded-l" readonly>
              <button onclick="copyReferralLink()" 
                      class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r">
                Copy
              </button>
            </div>
          </div>
          <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded">
            <p>Total referrals: <span id="referralCount">0</span></p>
            <p>Earnings: <span id="referralEarnings">0 FLUFFI</span></p>
          </div>
        </div>
      `;
      
    } catch (error) {
      console.error("Connection error:", error);
      alert("Wallet connection failed");
      const connectBtn = document.getElementById('connectReferralButton');
      if (connectBtn) {
        connectBtn.disabled = false;
        connectBtn.textContent = "Connect Wallet";
      }
    }
  } else {
    alert("Please install MetaMask or another Ethereum wallet");
  }
}

// Keep your existing copyReferralLink function
function copyReferralLink() {
  const linkInput = document.getElementById('userReferralLink');
  linkInput.select();
  document.execCommand('copy');
  alert("Copied to clipboard!");
}
// Add these variables to your existing state
let userWallet = null;
const referralSection = document.getElementById('referralSection');

// Unified wallet connection function (replace any existing connect functions)
async function connectWallet() {
  try {
    // Disable all connect buttons
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.disabled = true;
      btn.innerHTML = btn.innerHTML.replace('Connect Wallet', 'Connecting...');
    });

    // Request accounts
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    userWallet = accounts[0];
    
    // Update all connect buttons
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.textContent = `${userWallet.slice(0, 6)}...${userWallet.slice(-4)}`;
      btn.disabled = false;
    });

    // Generate referral UI if section exists
    if (referralSection) {
      generateReferralUI();
    }
    
  } catch (error) {
    console.error("Connection error:", error);
    document.querySelectorAll('[id*="connect"]').forEach(btn => {
      btn.disabled = false;
      btn.textContent = "Connect Wallet";
    });
  }
}

// Generate referral UI
function generateReferralUI() {
  referralSection.innerHTML = `
    <div class="space-y-4">
      <div>
        <label class="block mb-2">Your referral link:</label>
        <div class="flex">
          <input type="text" id="userReferralLink" 
                 value="${window.location.origin}${window.location.pathname}?ref=${userWallet}" 
                 class="flex-1 p-2 border rounded-l" readonly>
          <button onclick="copyReferralLink()" 
                  class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r">
            Copy
          </button>
        </div>
      </div>
      <div class="bg-gray-100 dark:bg-gray-700 p-3 rounded">
        <p>Total referrals: <span id="referralCount">0</span></p>
        <p>Earnings: <span id="referralEarnings">0 FLUFFI</span></p>
      </div>
    </div>
  `;
}

// Copy referral link
function copyReferralLink() {
  const linkInput = document.getElementById('userReferralLink');
  linkInput.select();
  document.execCommand('copy');
  alert("Copied to clipboard!");
}

// Initialize (add to your existing DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  // Check for existing connection
  if (window.ethereum?.selectedAddress) {
    userWallet = window.ethereum.selectedAddress;
    if (referralSection) generateReferralUI();
  }
  
  // Check URL for referral parameter
  const urlParams = new URLSearchParams(window.location.search);
  const refCode = urlParams.get('ref');
  if (refCode) {
    localStorage.setItem('referralCode', refCode);
  }
});
