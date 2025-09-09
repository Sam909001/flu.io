// Global variables
let userWalletAddress = null;
let tasksCompleted = {
  twitter: false,
  telegram: false,
  retweet: false
};

// Timer variables
let endDate = new Date('2025-12-31T23:59:59').getTime();

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
  // Set dark mode based on localStorage
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.getElementById('darkModeIcon').textContent = '☀️';
  }
  
  // Load completed tasks from localStorage
  const savedTasks = localStorage.getItem('completedTasks');
  if (savedTasks) {
    tasksCompleted = JSON.parse(savedTasks);
    updateTaskUI();
  }
  
  // Set up wallet button event
  document.getElementById('walletButton').addEventListener('click', openWalletModal);
  
  // Set up airdrop form event
  document.getElementById('airdropForm').addEventListener('submit', function(e) {
    e.preventDefault();
    claimAirdrop();
  });
  
  // Check if wallet was previously connected
  if (localStorage.getItem('walletConnected') === 'true') {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
      handleWalletConnection(savedAddress);
    }
  }
  
  // Start timer
  updateTimer();
  setInterval(updateTimer, 1000);
  
  // Check URL for dev mode
  if (window.location.hash === '#dev') {
    document.getElementById('devSection').classList.remove('hidden');
  }
  
  // Hide QR code initially
  document.getElementById('walletConnectQrCode').innerHTML = '';
  
  // Create floating particles
  createParticles();
  
  // Add glass effect to cards
  document.querySelectorAll('.bg-white, .dark\\:bg-gray-800').forEach(card => {
    card.classList.add('glass-card');
  });
  
  // Add glow effect to buttons
  document.querySelectorAll('.bg-green-500, .bg-green-700').forEach(btn => {
    btn.classList.add('btn-glow');
  });
});

// Timer functions
function updateTimer() {
  const now = new Date().getTime();
  const timeLeft = endDate - now;
  
  if (timeLeft < 0) {
    document.getElementById('days').textContent = '00';
    document.getElementById('hours').textContent = '00';
    document.getElementById('minutes').textContent = '00';
    document.getElementById('seconds').textContent = '00';
    return;
  }
  
  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
  
  document.getElementById('days').textContent = days.toString().padStart(2, '0');
  document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
  document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}

function resetTimer() {
  endDate = new Date().getTime() + (7 * 24 * 60 * 60 * 1000) + (12 * 60 * 60 * 1000) + (45 * 60 * 1000) + (30 * 1000);
  updateTimer();
}

function setTimer(hours, minutes, seconds) {
  endDate = new Date().getTime() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
  updateTimer();
}

// Wallet modal functions
function openWalletModal() {
  document.getElementById('walletModal').classList.add('active');
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.remove('active');
}

function openWalletConnectModal(uri) {
  const qrCodeElement = document.getElementById('walletConnectQrCode');
  
  // Generate a simple QR code placeholder
  qrCodeElement.innerHTML = `
    <div style="width: 200px; height: 200px; background: white; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; padding: 10px; border-radius: 8px;">
      <div>
        <div style="margin-bottom: 10px;">📱 QR Code</div>
        <div style="font-size: 10px; color: #666; word-break: break-all;">${uri}</div>
      </div>
    </div>
  `;
  
  document.getElementById('walletConnectModal').classList.add('active');
}

function closeWalletConnectModal() {
  document.getElementById('walletConnectModal').classList.remove('active');
}

function openWalletConnectLink() {
  alert('This would normally open your mobile wallet app.');
}

// Help modal functions
function showWalletHelp(walletType) {
  const helpContent = document.getElementById('helpContent');
  
  const helpData = {
    metamask: {
      title: 'MetaMask Setup Guide',
      icon: 'fab fa-firefox-browser',
      platforms: [
        {
          name: 'Desktop Browser',
          icon: 'fas fa-desktop',
          steps: [
            'Visit metamask.io and download the browser extension',
            'Create a new wallet or import existing one',
            'Set up your password and backup phrase',
            'Click "Connect Wallet" on this page',
            'Select MetaMask and approve the connection'
          ]
        },
        {
          name: 'Mobile App',
          icon: 'fas fa-mobile-alt',
          steps: [
            'Download MetaMask app from App Store or Google Play',
            'Create or import your wallet',
            'Open the app and use the built-in browser',
            'Navigate to this airdrop page',
            'Tap "Connect Wallet" and select MetaMask'
          ]
        }
      ]
    },
    trust: {
      title: 'Trust Wallet Setup Guide',
      icon: 'fas fa-shield-alt',
      platforms: [
        {
          name: 'Mobile App',
          icon: 'fas fa-mobile-alt',
          steps: [
            'Download Trust Wallet from App Store or Google Play',
            'Create a new wallet or import existing one',
            'Secure your wallet with PIN or biometrics',
            'Use the DApp browser within Trust Wallet',
            'Navigate to this page and connect your wallet'
          ]
        }
      ]
    },
    walletconnect: {
      title: 'WalletConnect Setup Guide',
      icon: 'fas fa-qrcode',
      platforms: [
        {
          name: 'Any Mobile Wallet',
          icon: 'fas fa-mobile-alt',
          steps: [
            'Open your mobile wallet app (Trust, MetaMask, etc.)',
            'Look for WalletConnect or Scan QR option',
            'Click "Connect Wallet" on this page',
            'Select WalletConnect option',
            'Scan the QR code with your mobile wallet',
            'Approve the connection in your wallet app'
          ]
        }
      ]
    },
    phantom: {
      title: 'Phantom Wallet Setup Guide',
      icon: 'fas fa-ghost',
      platforms: [
        {
          name: 'Browser Extension',
          icon: 'fas fa-desktop',
          steps: [
            'Visit phantom.app and install the browser extension',
            'Create a new Solana wallet or import existing one',
            'Set up your password and backup phrase',
            'Click "Connect Wallet" on this page',
            'Select Phantom and approve the connection'
          ]
        },
        {
          name: 'Mobile App',
          icon: 'fas fa-mobile-alt',
          steps: [
            'Download Phantom from App Store or Google Play',
            'Create or import your Solana wallet',
            'Open the app and use the built-in browser',
            'Navigate to this airdrop page',
            'Tap "Connect Wallet" and select Phantom'
          ]
        }
      ]
    }
  };
  
  const data = helpData[walletType];
  
  helpContent.innerHTML = `
    <div class="help-title">
      <div class="help-icon-wrapper">
        <i class="${data.icon} help-icon"></i>
      </div>
      ${data.title}
    </div>
    
    ${data.platforms.map(platform => `
      <div class="help-platform">
        <div class="platform-header">
          <div class="platform-icon">
            <i class="${platform.icon}"></i>
          </div>
          <h3>${platform.name}</h3>
        </div>
        <ol class="help-steps">
          ${platform.steps.map(step => `<li>${step}</li>`).join('')}
        </ol>
      </div>
    `).join('')}
  `;
  
  document.getElementById('helpModal').classList.add('active');
}

function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('active');
}

// Wallet connection function
async function connectWallet(walletType) {
  closeWalletModal();
  
  try {
    
    if (walletType === 'metamask') {
      if (isMobile()) {
        if (window.ethereum && window.ethereum.isMetaMask) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleWalletConnection(accounts[0]);
            
            window.ethereum.on('accountsChanged', (accounts) => {
              if (accounts.length === 0) {
                disconnectWallet();
              } else {
                handleWalletConnection(accounts[0]);
              }
            });
          } catch (error) {
            window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
          }
        } else {
          window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
        }
      } else {
        if (window.ethereum && window.ethereum.isMetaMask) {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          handleWalletConnection(accounts[0]);
          
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
              disconnectWallet();
            } else {
              handleWalletConnection(accounts[0]);
            }
          });
        } else {
          showWalletError("Please install MetaMask extension");
        }
      }
    }
    else if (walletType === 'trust') {
      if (isMobile()) {
        if (window.ethereum && window.ethereum.isTrust) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleWalletConnection(accounts[0]);
          } catch (error) {
            window.location.href = `https://link.trustwallet.com/open_url?coin=60&url=${encodeURIComponent(window.location.href)}`;
          }
        } else {
          window.location.href = `https://link.trustwallet.com/open_url?coin=60&url=${encodeURIComponent(window.location.href)}`;
        }
      } else {
        if (window.ethereum && window.ethereum.isTrust) {
          try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            handleWalletConnection(accounts[0]);
          } catch (error) {
            showWalletError("Failed to connect Trust Wallet");
          }
        } else {
          showWalletError("Please install Trust Wallet extension");
        }
      }
    }
    else if (walletType === 'walletconnect') {
      // Simulate WalletConnect flow with QR code
      const fakeUri = "wc:demo-connection-1234";
      openWalletConnectModal(fakeUri);

      // Simulate connection after 2 seconds
      setTimeout(() => {
        closeWalletConnectModal();
        handleWalletConnection("0x1a2b3c4d5e6f7e8d9c0b1a2b3c4d5e6f7e8d9c0b");
      }, 2000);
    }
    else if (walletType === 'phantom') {
      if (isMobile()) {
        if (window.phantom && window.phantom.solana) {
          try {
            const response = await window.phantom.solana.connect();
            handleWalletConnection(response.publicKey.toString());
          } catch (error) {
            window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`;
          }
        } else {
          window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`;
        }
      } else {
        if (window.phantom && window.phantom.solana) {
          try {
            const response = await window.phantom.solana.connect();
            handleWalletConnection(response.publicKey.toString());
          } catch (error) {
            showWalletError("Failed to connect Phantom wallet");
          }
        } else {
          showWalletError("Please install Phantom wallet");
        }
      }
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    showWalletError("Failed to connect wallet");
  }
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function handleWalletConnection(address) {
  userWalletAddress = address;
  
  const walletButtons = document.getElementById('walletButtons');
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
  
  walletButtons.innerHTML = `
    <span class="wallet-address-display">${shortAddress}</span>
    <button class="disconnect-btn" onclick="disconnectWallet()">Disconnect</button>
  `;
  
  document.getElementById('walletAddress').value = address;
  
  localStorage.setItem('walletConnected', 'true');
  localStorage.setItem('walletAddress', address);
  
  // Check if this wallet has already claimed the airdrop
  checkAirdropStatus(address);
}

// Check if a wallet has already claimed the airdrop
function checkAirdropStatus(walletAddress) {
  const claimedWallets = JSON.parse(localStorage.getItem('claimedWallets') || '[]');
  const messageContainer = document.getElementById('rateLimitMessage');
  
  if (claimedWallets.includes(walletAddress)) {
    messageContainer.innerHTML = `
      <div class="already-claimed">
        <i class="fas fa-check-circle"></i>
        <span>You have already claimed the airdrop with this wallet address. Each wallet can only claim once.</span>
      </div>
    `;
    messageContainer.classList.remove('hidden');
    
    // Disable the claim button
    const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
  } else {
    messageContainer.classList.add('hidden');
    
    // Enable the claim button
    const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
}

function disconnectWallet() {
  userWalletAddress = null;
  
  const walletButtons = document.getElementById('walletButtons');
  walletButtons.innerHTML = `
    <button id="walletButton" class="bg-green-700 hover:bg-green-800 text-white py-1 px-3 rounded pulse">Connect Wallet</button>
  `;
  
  document.getElementById('walletButton').addEventListener('click', openWalletModal);
  
  document.getElementById('walletAddress').value = '';
  
  // Hide rate limit message
  document.getElementById('rateLimitMessage').classList.add('hidden');
  
  // Enable the claim button
  const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
  submitBtn.disabled = false;
  submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('walletAddress');
}

function showWalletError(message) {
  // Create error element
  const errorElement = document.createElement('div');
  errorElement.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
  errorElement.textContent = message;
  
  // Add to document
  document.body.appendChild(errorElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    errorElement.remove();
  }, 3000);
}

// Task verification functions
async function verifyTwitterFollow() {
  if (tasksCompleted.twitter) return;
  
  const username = document.getElementById('twitterUsername').value.trim();
  if (!username) {
    showWalletError("Please enter your Twitter username");
    return;
  }
  
  try {
    // Show loading state
    const button = document.getElementById('verifyTwitterBtn');
    button.disabled = true;
    button.textContent = 'Verifying...';
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // For demo purposes, assume verification succeeded
    const verificationSuccess = true;
    
    if (verificationSuccess) {
      tasksCompleted.twitter = true;
      localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
      updateTaskUI();
      alert(`Twitter follow verified successfully for @${username}! +10,000 FLUFFI tokens earned.`);
    } else {
      showWalletError("Could not verify Twitter follow. Please make sure you're following @FLUFFIOFFICIAL.");
    }
  } catch (error) {
    console.error("Twitter verification error:", error);
    showWalletError("Failed to verify Twitter follow");
  } finally {
    const button = document.getElementById('verifyTwitterBtn');
    button.disabled = false;
    button.textContent = 'Verify';
  }
}

async function verifyTelegramJoin() {
  if (tasksCompleted.telegram) return;
  
  const username = document.getElementById('telegramUsername').value.trim();
  if (!username) {
    showWalletError("Please enter your Telegram username");
    return;
  }
  
  try {
    const button = document.getElementById('verifyTelegramBtn');
    button.disabled = true;
    button.textContent = 'Verifying...';
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const verificationSuccess = true;
    
    if (verificationSuccess) {
      tasksCompleted.telegram = true;
      localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
      updateTaskUI();
      alert(`Telegram join verified successfully for @${username}! +10,000 FLUFFI tokens earned.`);
    } else {
      showWalletError("Could not verify Telegram membership. Please join our Telegram group first.");
    }
  } catch (error) {
    console.error("Telegram verification error:", error);
    showWalletError("Failed to verify Telegram join");
  } finally {
    const button = document.getElementById('verifyTelegramBtn');
    button.disabled = false;
    button.textContent = 'Verify';
  }
}

async function verifyRetweet() {
  if (tasksCompleted.retweet) return;
  
  try {
    const button = document.getElementById('verifyRetweetBtn');
    button.disabled = true;
    button.textContent = 'Verifying...';
    
    // Open the tweet in a new tab
    window.open('https://twitter.com/FLUFFIOFFICIAL/status/1234567890', '_blank');
    
    // Wait for user to potentially retweet
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const confirmed = confirm("Please confirm you've liked and retweeted our pinned tweet.");
    if (confirmed) {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const verificationSuccess = true;
      
      if (verificationSuccess) {
        tasksCompleted.retweet = true;
        localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
        updateTaskUI();
        alert("Retweet verified successfully! +30,000 FLUFFI tokens earned.");
      } else {
        showWalletError("Could not verify retweet. Please make sure you've liked and retweeted our pinned tweet.");
      }
    }
  } catch (error) {
    console.error("Retweet verification error:", error);
    showWalletError("Failed to verify retweet");
  } finally {
    const button = document.getElementById('verifyRetweetBtn');
    button.disabled = false;
    button.textContent = 'Verify';
  }
}

function updateTaskUI() {
  document.getElementById('task1').checked = tasksCompleted.twitter;
  document.getElementById('task2').checked = tasksCompleted.telegram;
  document.getElementById('task3').checked = tasksCompleted.retweet;
  
  document.getElementById('twitterStatus').textContent = tasksCompleted.twitter ? '(Verified)' : '(Not verified)';
  document.getElementById('twitterStatus').className = tasksCompleted.twitter ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  document.getElementById('telegramStatus').textContent = tasksCompleted.telegram ? '(Verified)' : '(Not verified)';
  document.getElementById('telegramStatus').className = tasksCompleted.telegram ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  document.getElementById('retweetStatus').textContent = tasksCompleted.retweet ? '(Verified)' : '(Not verified)';
  document.getElementById('retweetStatus').className = tasksCompleted.retweet ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  const twitterBtn = document.getElementById('verifyTwitterBtn');
  const telegramBtn = document.getElementById('verifyTelegramBtn');
  const retweetBtn = document.getElementById('verifyRetweetBtn');
  
  if (tasksCompleted.twitter) {
    twitterBtn.textContent = 'Verified';
    twitterBtn.classList.add('completed');
    twitterBtn.onclick = null;
    document.getElementById('twitterUsername').disabled = true;
  }
  
  if (tasksCompleted.telegram) {
    telegramBtn.textContent = 'Verified';
    telegramBtn.classList.add('completed');
    telegramBtn.onclick = null;
    document.getElementById('telegramUsername').disabled = true;
  }
  
  if (tasksCompleted.retweet) {
    retweetBtn.textContent = 'Verified';
    retweetBtn.classList.add('completed');
    retweetBtn.onclick = null;
  }
}

// For development - simulate task completion
function simulateTwitterFollow() {
  document.getElementById('twitterUsername').value = 'testuser';
  tasksCompleted.twitter = true;
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  updateTaskUI();
  alert("Twitter follow simulated successfully!");
}

function simulateTelegramJoin() {
  document.getElementById('telegramUsername').value = 'testuser';
  tasksCompleted.telegram = true;
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  updateTaskUI();
  alert("Telegram join simulated successfully!");
}

function simulateRetweet() {
  tasksCompleted.retweet = true;
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  updateTaskUI();
  alert("Retweet simulated successfully!");
}

function resetTasks() {
  tasksCompleted = {
    twitter: false,
    telegram: false,
    retweet: false
  };
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  document.getElementById('twitterUsername').value = '';
  document.getElementById('telegramUsername').value = '';
  document.getElementById('twitterUsername').disabled = false;
  document.getElementById('telegramUsername').disabled = false;
  updateTaskUI();
  alert("Tasks reset successfully!");
}

// Clear rate limit for development
function clearRateLimit() {
  localStorage.removeItem('claimedWallets');
  alert("Rate limit cleared. All wallets can now claim the airdrop again.");
  
  // Refresh the status if a wallet is connected
  if (userWalletAddress) {
    checkAirdropStatus(userWalletAddress);
  }
}

// Confetti effect
function createConfetti() {
  const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'];
  
  for (let i = 0; i < 150; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.left = Math.random() * 100 + 'vw';
    confetti.style.top = '100vh';
    confetti.style.width = Math.random() * 10 + 5 + 'px';
    confetti.style.height = Math.random() * 10 + 5 + 'px';
    confetti.style.animationDuration = Math.random() * 3 + 2 + 's';
    document.body.appendChild(confetti);
    
    // Remove confetti after animation
    setTimeout(() => {
      confetti.remove();
    }, 5000);
  }
}

// Airdrop claim function
async function claimAirdrop() {
  const email = document.getElementById('email').value;
  const walletAddress = document.getElementById('walletAddress').value;
  
  if (!walletAddress) {
    showWalletError("Please connect your wallet first");
    return;
  }
  
  if (!email) {
    showWalletError("Please enter your email address");
    return;
  }
  
  // Check rate limit
  const claimedWallets = JSON.parse(localStorage.getItem('claimedWallets') || '[]');
  if (claimedWallets.includes(walletAddress)) {
    showWalletError("This wallet has already claimed the airdrop. Each wallet can only claim once.");
    return;
  }
  
  try {
    const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Processing...';
    
    const anyTaskCompleted = tasksCompleted.twitter || tasksCompleted.telegram || tasksCompleted.retweet;
    
    if (!anyTaskCompleted) {
      throw new Error("Please complete at least one task to claim the airdrop");
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    let bonusTokens = 0;
    if (tasksCompleted.twitter) bonusTokens += 10000;
    if (tasksCompleted.telegram) bonusTokens += 10000;
    if (tasksCompleted.retweet) bonusTokens += 30000;
    
    // Add wallet to claimed list
    claimedWallets.push(walletAddress);
    localStorage.setItem('claimedWallets', JSON.stringify(claimedWallets));
    
    createConfetti();
    alert(`🎉 Airdrop claimed successfully! You earned ${bonusTokens} bonus FLUFFI tokens. Your tokens will be distributed after the presale ends.`);
    
    // Update UI to show this wallet has claimed
    checkAirdropStatus(walletAddress);
    
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  } catch (error) {
    console.error("Airdrop error:", error);
    showWalletError(error.message || "Airdrop claim failed");
    const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Claim Airdrop';
  }
}

// Toggle dark mode function
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = !html.classList.contains('dark');
  
  html.classList.toggle('dark', isDark);
  localStorage.setItem('darkMode', isDark);
  
  const darkModeIcon = document.getElementById('darkModeIcon');
  darkModeIcon.textContent = isDark ? '☀️' : '🌙';
}

// Function to create floating particles
function createParticles() {
  const container = document.getElementById('particles-container');
  const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.classList.add('particle');
    
    // Random properties
    const size = Math.random() * 20 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.background = color;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(particle);
  }
}
