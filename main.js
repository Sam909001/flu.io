 <!-- Main Application Script -->
  <script>
    // Configuration
    const FLUFFI_CONTRACT_ADDRESS = "0x60A94bc12d0d4F782Fd597e5E1222247CFb7E297";
    const FLUFFI_CONTRACT_ABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"},{"indexed":true,"internalType":"address","name":"referrer","type":"address"}],"name":"Contribution","type":"event"},{"anonymous":false,"inputs":[],"name":"PresaleEnded","type":"event"},{"inputs":[],"name":"RATE","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"referrer","type":"address"}],"name":"contribute","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"contributions","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"endPresale","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"user","type":"address"}],"name":"getContributorAmount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"presaleActive","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"referrals","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"setTokenAddress","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"tokenAddress","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"totalRaised","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"withdrawFunds","outputs":[],"stateMutability":"nonpayable","type":"function"},{"stateMutability":"payable","type":"receive"}];
   const WALLETCONNECT_CONFIG = {
  projectId: 'b74a733c47def7b6672eb9ad072c4e8a',
  chains: [56], // BSC Mainnet
  showQrModal: false,
  qrModalOptions: {
    themeMode: 'dark',
    mobileWallets: [
      {
        id: 'metamask',
        name: 'MetaMask',
        links: {
          native: 'metamask://',
          universal: 'https://metamask.app.link'
        }
      },
      {
        id: 'trust',
        name: 'Trust Wallet',
        links: {
          native: 'trust://',
          universal: 'https://link.trustwallet.com'
        }
      }
    ]
  },
  metadata: {
    name: "FLUFFI Presale",
    description: "Connect to participate in FLUFFI presale",
    url: window.location.href,
    icons: ["https://fluffi.site/logo.png"]
  }
};
    // Global variables
    let walletProvider = null;
    let ethersProvider = null;
    let userWalletAddress = null;
    let tokenChart = null;
    let currentWCUri = ''; // Store WalletConnect URI

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', function() {
      // Initialize dark mode
      if (localStorage.getItem('darkMode') === 'true') {
        document.documentElement.classList.add('dark');
        document.getElementById('darkModeIcon').textContent = '☀️';
      }

      // Check if MetaMask is installed
      if (window.ethereum?.isMetaMask) {
        document.getElementById('metamaskInstalledBadge').classList.remove('hidden');
      }

      // Initialize token chart
      initTokenChart();

      // Initialize timers
      updateTimers();
      updateNextIncreaseTime();
      setInterval(() => {
        updateTimers();
        updateNextIncreaseTime();
      }, 1000);

      // Check for referral parameter
      checkReferral();
    });

    // ===== WALLET FUNCTIONS =====
    function openWalletModal() {
      document.getElementById('walletModalOverlay').classList.remove('hidden');
      document.getElementById('walletModal').classList.remove('hidden');
    }

    function closeWalletModal() {
      document.getElementById('walletModalOverlay').classList.add('hidden');
      document.getElementById('walletModal').classList.add('hidden');
      document.getElementById('qrCodeContainer').classList.add('hidden');
      document.getElementById('walletConnectSection').classList.remove('hidden');
    }

    async function connectWallet() {
      openWalletModal();
    }

    async function connectMetaMask() {
  try {
    if (window.ethereum) {
      // Try regular connection first
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      userWalletAddress = accounts[0];
      ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
      updateWalletUI();
      closeWalletModal();
    } else if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Mobile deep link
      window.location.href = `https://metamask.app.link/dapp/${encodeURIComponent(window.location.hostname)}`;
    } else {
      // Desktop fallback
      window.open('https://metamask.io/download.html', '_blank');
    }
  } catch (error) {
    console.error("MetaMask error:", error);
    showWalletError("MetaMask connection failed: " + error.message);
  }
}
    
    // Fixed WalletConnect function
    async function connectWalletConnect() {
      try {
        const { default: WalletConnectProvider } = await import('https://unpkg.com/@walletconnect/web3-provider@2.8.0/dist/umd/index.min.js');
        
        walletProvider = new WalletConnectProvider(WALLETCONNECT_CONFIG);
        
        // Subscribe to events
        walletProvider.on("display_uri", (err, payload) => {
          const { uri } = payload.params[0];
          currentWCUri = uri;
          
          document.getElementById('walletConnectSection').classList.add('hidden');
          document.getElementById('qrCodeContainer').classList.remove('hidden');
          
          // Generate QR code
          document.getElementById('qrImage').src = 
            `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(uri)}`;
        });
        
        // Enable session
        await walletProvider.enable();
        
        // Get accounts
        const accounts = await walletProvider.request({ method: 'eth_accounts' });
        userWalletAddress = accounts[0];
        ethersProvider = new ethers.providers.Web3Provider(walletProvider);
        
        // Update UI
        updateWalletUI();
        closeWalletModal();
      } catch (error) {
        console.error("WalletConnect error:", error);
        showWalletError("Connection failed: " + error.message);
      }
    }

    function showWalletOptions() {
      document.getElementById('walletConnectSection').classList.remove('hidden');
      document.getElementById('qrCodeContainer').classList.add('hidden');
    }

    function updateWalletUI() {
      const walletButton = document.getElementById('walletButton');
      const walletStatus = document.getElementById('walletStatus');
      const connectedAddress = document.getElementById('connectedAddress');
      
      if (userWalletAddress) {
        const shortAddress = `${userWalletAddress.slice(0, 6)}...${userWalletAddress.slice(-4)}`;
        walletButton.textContent = shortAddress;
        walletButton.classList.add('connected');
        walletStatus.classList.remove('hidden');
        connectedAddress.textContent = shortAddress;
      } else {
        walletButton.textContent = 'Connect Wallet';
        walletButton.classList.remove('connected');
        walletStatus.classList.add('hidden');
      }
    }

    function disconnectWallet() {
      if (walletProvider) {
        walletProvider.disconnect();
        walletProvider = null;
      }
      ethersProvider = null;
      userWalletAddress = null;
      updateWalletUI();
    }

    function showWalletError(message) {
      const errorElement = document.getElementById('walletError');
      errorElement.textContent = message;
      errorElement.classList.remove('hidden');
      setTimeout(() => errorElement.classList.add('hidden'), 5000);
    }

    // Fixed Phantom Wallet connection
    async function connectPhantom() {
      try {
        if (window.phantom?.ethereum) {
          const provider = window.phantom.ethereum;
          const accounts = await provider.request({ method: 'eth_requestAccounts' });
          userWalletAddress = accounts[0];
          ethersProvider = new ethers.providers.Web3Provider(provider);
          updateWalletUI();
          closeWalletModal();
        } else if (window.ethereum?.isPhantom) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          userWalletAddress = accounts[0];
          ethersProvider = new ethers.providers.Web3Provider(window.ethereum);
          updateWalletUI();
          closeWalletModal();
        } else {
          if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
            window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}`;
          } else {
            window.open('https://phantom.app/', '_blank');
          }
        }
      } catch (error) {
        console.error("Phantom Wallet error:", error);
        showWalletError("Phantom connection failed: " + error.message);
      }
    }

async function connectTrustWallet() {
  try {
    if (window.ethereum?.isTrust) {
      return connectMetaMask(); // Trust Wallet uses same API as MetaMask
    } else if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Mobile deep link
      window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=${encodeURIComponent(window.location.href)}`;
    } else {
      return connectWalletConnect(); // Desktop fallback
    }
  } catch (error) {
    console.error("Trust Wallet error:", error);
    showWalletError("Trust Wallet connection failed: " + error.message);
  }
}
    
async function connectBinanceWallet() {
  try {
    // Show connecting status
    showWalletError("Connecting to Binance Wallet...", 'info');
    
    // 1. First try direct connection if Binance Chain is available
    if (window.BinanceChain) {
      const accounts = await window.BinanceChain.request({ 
        method: 'eth_requestAccounts' 
      });
      
      userWalletAddress = accounts[0];
      ethersProvider = new ethers.providers.Web3Provider(window.BinanceChain);
      
      // Verify the connection
      const chainId = await window.BinanceChain.request({ method: 'eth_chainId' });
      if (!chainId) throw new Error("Connection failed");
      
      updateWalletUI();
      closeWalletModal();
      showWalletError("Binance Wallet connected!", 'success');
      return;
    }

    // 2. Mobile handling
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Create hidden iframe for better deeplinking
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `bnb://wallet/dapp?url=${encodeURIComponent(window.location.href)}`;
      document.body.appendChild(iframe);
      
      // Set timeout for fallback
      setTimeout(() => {
        if (!userWalletAddress) {
          window.location.href = `https://bnb.mobi/wallet/dapp?url=${encodeURIComponent(window.location.href)}`;
        }
      }, 500);
      
      return;
    }

    // 3. Desktop fallback
    const newWindow = window.open('https://www.bnbchain.org/en/binance-wallet', '_blank');
    if (!newWindow || newWindow.closed) {
      showWalletError("Pop-up blocked. Please allow pop-ups for this site.");
    }
    
  } catch (error) {
    console.error("Binance Wallet error:", error);
    
    let errorMessage = "Binance Wallet connection failed";
    if (error.code === 4001) {
      errorMessage = "Connection rejected by user";
    } else {
      errorMessage += ": " + (error.message || error.toString());
    }
    
    showWalletError(errorMessage);
    
    // Fallback to WalletConnect if mobile
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      setTimeout(() => connectWalletConnect(), 1000);
    }
  }
}

    async function connectCoinbaseWallet() {
  try {
    // Show connecting status
    showWalletError("Connecting to Coinbase Wallet...", 'info');
    
    // 1. First try direct connection if Coinbase Wallet is available
    if (window.coinbaseWalletExtension) {
      const accounts = await window.coinbaseWalletExtension.request({ 
        method: 'eth_requestAccounts' 
      });
      
      userWalletAddress = accounts[0];
      ethersProvider = new ethers.providers.Web3Provider(window.coinbaseWalletExtension);
      
      // Verify the connection
      const chainId = await window.coinbaseWalletExtension.request({ method: 'eth_chainId' });
      if (!chainId) throw new Error("Connection failed");
      
      updateWalletUI();
      closeWalletModal();
      showWalletError("Coinbase Wallet connected!", 'success');
      return;
    }

    // 2. Mobile handling
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      // Create hidden iframe for better deeplinking
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
      document.body.appendChild(iframe);
      
      // Set timeout for fallback
      setTimeout(() => {
        if (!userWalletAddress) {
          window.location.href = `https://go.cb-w.com/dapp?cb_url=${encodeURIComponent(window.location.href)}`;
        }
      }, 500);
      
      return;
    }

    // 3. Desktop fallback
    const newWindow = window.open('https://www.coinbase.com/wallet', '_blank');
    if (!newWindow || newWindow.closed) {
      showWalletError("Pop-up blocked. Please allow pop-ups for this site.");
    }
    
  } catch (error) {
    console.error("Coinbase Wallet error:", error);
    
    let errorMessage = "Coinbase Wallet connection failed";
    if (error.code === 4001) {
      errorMessage = "Connection rejected by user";
    } else {
      errorMessage += ": " + (error.message || error.toString());
    }
    
    showWalletError(errorMessage);
    
    // Fallback to WalletConnect if mobile
    if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
      setTimeout(() => connectWalletConnect(), 1000);
    }
  }
}
  </script>
    <script>
    // ===== PRESALE FUNCTIONS =====
    async function buyFluffi() {
  const amount = document.getElementById('amountInput').value;
  const currency = document.getElementById('currencySelect').value;
  const ref = document.getElementById('refInput').value;
  
  if (!userWalletAddress) {
    showWalletError('Please connect your wallet first.');
    openWalletModal();
    return;
  }
  
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    showWalletError('Please enter a valid amount.');
    return;
  }
  
  try {
    const buyBtn = document.querySelector('button[onclick="buyFluffi()"]');
    const prevText = buyBtn.textContent;
    buyBtn.textContent = '⏳ Processing...';
    buyBtn.disabled = true;
    
    let ethValue;
    if (currency === 'USD') {
      const usdToEth = 3000; // Example rate
      ethValue = (Number(amount) / usdToEth).toFixed(6);
    } else {
      ethValue = Number(amount).toFixed(6);
    }
    
    let referralAddress = ethers.constants.AddressZero;
    if (ref) {
      if (!ethers.utils.isAddress(ref)) {
        throw new Error("Invalid referral address");
      }
      referralAddress = ref;
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(FLUFFI_CONTRACT_ADDRESS, FLUFFI_CONTRACT_ABI, signer);
    
    // Estimate gas first
    const gasEstimate = await contract.estimateGas.contribute(referralAddress, {
      value: ethers.utils.parseEther(ethValue.toString())
    });
    
    const tx = await contract.contribute(referralAddress, { 
      value: ethers.utils.parseEther(ethValue.toString()),
      gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
    });
    
    await tx.wait();
    
    buyBtn.textContent = prevText;
    buyBtn.disabled = false;
    alert('🎉 Purchase successful! Transaction hash: ' + tx.hash);
    
    // Update displayed balances
    await updateUserBalances();
  } catch (err) {
    console.error("Buy error:", err);
    const buyBtn = document.querySelector('button[onclick="buyFluffi()"]');
    if (buyBtn) {
      buyBtn.textContent = '🚀 Buy Now';
      buyBtn.disabled = false;
    }
    showWalletError(err.message || "Transaction failed");
  }
}

    // ===== STAKING FUNCTIONS =====
    async function stakeFluffi() {
      try {
        if (!userWalletAddress) {
          showWalletError("Please connect your wallet first");
          openWalletModal();
          return;
        }
        
        const amount = document.getElementById('stakeInput').value;
        const amountNum = parseFloat(amount);
        
        if (isNaN(amountNum)) {
          showWalletError("Please enter a valid amount");
          return;
        }
        
        const signer = ethersProvider.getSigner();
        const fluffiContract = new ethers.Contract(
          FLUFFI_CONTRACT_ADDRESS,
          FLUFFI_CONTRACT_ABI,
          signer
        );
        
        // Show loading state
        const stakeBtn = document.querySelector('#staking button');
        const originalText = stakeBtn.textContent;
        stakeBtn.disabled = true;
        stakeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
        
        // Convert amount to wei
        const amountWei = ethers.utils.parseUnits(amount, 18);
        
        // Send transaction
        const tx = await fluffiContract.stake(amountWei);
        await tx.wait();
        
        // Reset button
        stakeBtn.disabled = false;
        stakeBtn.textContent = originalText;
        
        // Update balances
        await updateUserBalances();
        
        alert("Staking successful!");
      } catch (error) {
        console.error("Stake error:", error);
        showWalletError(error.message || "Staking failed");
        
        // Reset button if error occurs
        const stakeBtn = document.querySelector('#staking button');
        if (stakeBtn) {
          stakeBtn.disabled = false;
          stakeBtn.textContent = 'Stake Now';
        }
      }
    }

    // ===== CLAIM FUNCTIONS =====
    async function claimTokens() {
  try {
    if (!userWalletAddress) {
      throw new Error("Please connect your wallet first");
    }
    
    const provider = ethersProvider || new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const fluffiContract = new ethers.Contract(
      FLUFFI_CONTRACT_ADDRESS,
      FLUFFI_CONTRACT_ABI,
      signer
    );
    
    // Check if presale has ended
    const presaleEnded = await fluffiContract.presaleEnded();
    if (!presaleEnded) {
      throw new Error("Presale has not ended yet");
    }
    
    // Check claimable amount
    const claimable = await fluffiContract.getClaimableAmount(userWalletAddress);
    if (claimable.lte(0)) {
      throw new Error("No tokens available to claim");
    }

    const claimBtn = document.querySelector('#claim button');
    const originalText = claimBtn.textContent;
    claimBtn.disabled = true;
    claimBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Claiming...';

    // Estimate gas first
    const gasEstimate = await fluffiContract.estimateGas.claim();
    
    const tx = await fluffiContract.claim({
      gasLimit: gasEstimate.mul(120).div(100) // 20% buffer
    });
    
    await tx.wait();
    
    claimBtn.disabled = false;
    claimBtn.textContent = originalText;
    await updateUserBalances();
    
    alert("Tokens claimed successfully!");
  } catch (error) {
    console.error("Claim error:", error);
    showWalletError(error.message || "Claim failed");
    
    const claimBtn = document.querySelector('#claim button');
    if (claimBtn) {
      claimBtn.disabled = false;
      claimBtn.textContent = 'Claim Tokens';
    }
  }
}

    // ===== UTILITY FUNCTIONS =====
    async function updateUserBalances() {
      if (!userWalletAddress) return;
      
      try {
        const provider = ethersProvider || new ethers.providers.Web3Provider(window.ethereum);
        const fluffiContract = new ethers.Contract(
          FLUFFI_CONTRACT_ADDRESS,
          FLUFFI_CONTRACT_ABI,
          provider
        );
        
        const [balance, staked, rewards] = await Promise.all([
          fluffiContract.balanceOf(userWalletAddress),
          fluffiContract.stakedBalance(userWalletAddress),
          fluffiContract.calculateRewards(userWalletAddress)
        ]);
        
        document.getElementById('userBalance').textContent = ethers.utils.formatUnits(balance, 18);
        document.getElementById('userStaked').textContent = ethers.utils.formatUnits(staked, 18);
        document.getElementById('userRewards').textContent = ethers.utils.formatUnits(rewards, 18);
        
      } catch (error) {
        console.error("Balance update error:", error);
      }
    }

    function toggleDarkMode() {
      const html = document.documentElement;
      html.classList.toggle('dark');
      localStorage.setItem('darkMode', html.classList.contains('dark'));
      
      // Update icon
      const darkModeIcon = document.getElementById('darkModeIcon');
      darkModeIcon.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
      
      // Update chart colors if needed
      if (tokenChart) {
        const isDark = html.classList.contains('dark');
        tokenChart.options.plugins.legend.labels.color = isDark ? '#FFFFFF' : '#111827';
        tokenChart.update();
      }
    }
function initTokenChart() {
  const ctx = document.getElementById('tokenChart');
  if (!ctx) return;
  
  const isDark = document.documentElement.classList.contains('dark');
  
  tokenChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Presale (40%)', 'Liquidity (30%)', 'Staking (20%)', 'Marketing (5%)', 'Team (5%)'],
      datasets: [{
        data: [40, 30, 20, 5, 5],
        backgroundColor: [
          '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'
        ],
        borderWidth: 2,
        borderColor: isDark ? '#1F2937' : '#FFFFFF'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: window.innerWidth < 768 ? 'bottom' : 'right',
          labels: {
            color: isDark ? '#FFFFFF' : '#111827',
            font: {
              size: window.innerWidth < 768 ? 12 : 14
            },
            padding: 20,
          }
        }
      },
      cutout: '65%'
    }
  });

  // Handle window resize
  window.addEventListener('resize', function() {
    if (tokenChart) {
      tokenChart.options.plugins.legend.position = window.innerWidth < 768 ? 'bottom' : 'right';
      tokenChart.update();
    }
  });
}
// ===== TIMER FUNCTIONS =====
function getPresaleStartTime() {
  let startTime = localStorage.getItem('presaleStartTime');
  if (!startTime) {
    // Set initial start time to now (for testing)
    startTime = Date.now();
    // For production, you might want to set a fixed start time:
    // startTime = new Date('2025-07-28T00:00:00Z').getTime();
    localStorage.setItem('presaleStartTime', startTime);
  }
  return parseInt(startTime);
}

function formatTime(ms) {
  const days = Math.floor(ms / (24 * 3600 * 1000));
  const hours = Math.floor((ms % (24 * 3600 * 1000)) / (3600 * 1000));
  const minutes = Math.floor((ms % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((ms % (60 * 1000)) / 1000);
  
  return {
    days: days.toString().padStart(2, '0'),
    hours: hours.toString().padStart(2, '0'),
    minutes: minutes.toString().padStart(2, '0'),
    seconds: seconds.toString().padStart(2, '0'),
    full: `${days}d ${hours}h ${minutes}m ${seconds}s`
  };
}

function updateNextIncreaseTime() {
  const now = Date.now();
  const startTime = getPresaleStartTime();
  const nextStageTime = startTime + (Math.floor((now - startTime) / (48 * 3600 * 1000)) + 1) * (48 * 3600 * 1000);
  const timeLeft = nextStageTime - now;
  
  const formatted = formatTime(timeLeft);
  document.getElementById('nextIncreaseTime').textContent = formatted.full;
}

function updateTimers() {
  const now = Date.now();
  const startTime = getPresaleStartTime();
  const endTime = startTime + (15 * 48 * 3600 * 1000); // 15 stages * 48 hours each
  const timeLeft = endTime - now;

  // Calculate stage progress
  const currentStage = Math.min(
    Math.floor((now - startTime) / (48 * 3600 * 1000)),
    14 // Max stage index
  );
  const stageEndTime = startTime + ((currentStage + 1) * 48 * 3600 * 1000);
  const stageTimeLeft = stageEndTime - now;
  const stageProgress = 1 - (stageTimeLeft / (48 * 3600 * 1000));

  // Update displays
  document.getElementById('current-stage').textContent = currentStage + 1;
  document.getElementById('stageProgressBar').style.width = `${((currentStage + stageProgress) / 15) * 100}%`;

  // Update price
  const price = (0.0001 * Math.pow(1.05, currentStage)).toFixed(6);
  document.getElementById('currentPrice').innerHTML = `$${price} <span class="price-tooltip"><i class="fas fa-info-circle text-blue-500"></i><span class="tooltip-text"><strong>Price Increase:</strong><br>+5% per stage (every 48 hours)<br>Next increase: <span id="nextIncreaseTime">00h 00m 00s</span></span></span>`;

  // Update timers
  if (timeLeft <= 0) {
    document.getElementById('presale-timer').innerHTML = "🎉 Presale Ended!";
    document.getElementById('stage-time-left').textContent = "00d 00h 00m 00s";
  } else {
    const formattedTotal = formatTime(timeLeft);
    const formattedStage = formatTime(stageTimeLeft);
    
    document.getElementById('presale-days').textContent = formattedTotal.days;
    document.getElementById('presale-hours').textContent = formattedTotal.hours;
    document.getElementById('presale-minutes').textContent = formattedTotal.minutes;
    document.getElementById('presale-seconds').textContent = formattedTotal.seconds;
    
    document.getElementById('stage-time-left').textContent = formattedStage.full;
  }
}

// Initialize the timer
function initTimer() {
  updateTimers();
  updateNextIncreaseTime();
  // Update every second
  setInterval(() => {
    updateTimers();
    updateNextIncreaseTime();
  }, 1000);
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Initialize dark mode
  if (localStorage.getItem('darkMode') === 'true' || 
      (localStorage.getItem('darkMode') === null && 
       window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
    document.getElementById('darkModeIcon').textContent = '☀️';
  } else {
    document.documentElement.classList.remove('dark');
    document.getElementById('darkModeIcon').textContent = '🌙';
  }

  // Check if MetaMask is installed
  if (window.ethereum?.isMetaMask) {
    document.getElementById('metamaskInstalledBadge').classList.remove('hidden');
  }

  // Initialize token chart
  initTokenChart();

  // Initialize timers
  initTimer();

  // Check for referral parameter
  checkReferral();
});

// Toggle dark mode function
function toggleDarkMode() {
  const html = document.documentElement;
  html.classList.toggle('dark');
  localStorage.setItem('darkMode', html.classList.contains('dark'));
  
  // Update icon
  const darkModeIcon = document.getElementById('darkModeIcon');
  darkModeIcon.textContent = html.classList.contains('dark') ? '☀️' : '🌙';
  
  // Update chart colors if needed
  if (tokenChart) {
    const isDark = html.classList.contains('dark');
    tokenChart.options.plugins.legend.labels.color = isDark ? '#FFFFFF' : '#111827';
    tokenChart.update();
  }
}
    // ===== REFERRAL FUNCTIONS =====
    function checkReferral() {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref');
      if (ref && /^0x[0-9a-fA-F]{40}$/.test(ref)) {
        document.getElementById('refInput').value = ref;
      }
    }

    async function connectReferralWallet() {
      if (!userWalletAddress) {
        await connectWallet();
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
            <label class="block mb-2 font-semibold">Your referral link:</label>
            <div class="flex">
              <input type="text" id="referralLinkInput" value="${referralLink}" 
                    class="flex-1 p-3 border rounded-l-lg dark:bg-gray-700 dark:border-gray-600 text-black dark:text-white" readonly>
              <button onclick="copyReferralLink()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 rounded-r-lg">
                Copy
              </button>
            </div>
          </div>
          <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p class="dark:text-gray-300">👥 Total referrals: <span class="font-bold">0</span></p>
            <p class="dark:text-gray-300">💰 Earnings: <span class="font-bold">0 FLUFFI</span></p>
          </div>
          <div class="mt-4">
            <p class="text-sm mb-2 font-semibold">Share your link:</p>
            <div class="flex space-x-3">
              <button onclick="shareOnTwitter()" class="flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
                🐦 Twitter
              </button>
              <button onclick="shareOnTelegram()" class="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
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
      alert("Referral link copied to clipboard!");
    }

    function shareOnTwitter() {
      const link = document.getElementById('referralLinkInput').value;
      window.open(`https://twitter.com/intent/tweet?text=Join%20$FLUFFI%20presale!%20🚀%20Use%20my%20referral%20link%20for%20bonus%20tokens:%20${encodeURIComponent(link)}%20%23FluffiArmy`, '_blank', 'noopener,noreferrer');
    }

    function shareOnTelegram() {
      const link = document.getElementById('referralLinkInput').value;
      window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=Join%20$FLUFFI%20presale!%20🚀%20Use%20my%20referral%20link%20for%20bonus%20tokens`, '_blank', 'noopener,noreferrer');
    }
  </script>
