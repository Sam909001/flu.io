// Global variables
let userWalletAddress = null;
let tasksCompleted = {
  twitter: false,
  telegram: false,
  retweet: false
};

// Timer variables
let endDate = new Date('2025-12-31T23:59:59').getTime();

// Solana connection variables
let solanaConnection = null;
let solanaProvider = null;
let isSolanaWallet = false;

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

// ========== UPDATED WALLET CONNECTION FUNCTIONS ==========

// Wallet modal functions
function openWalletModal() {
  document.getElementById('walletModal').classList.add('active');
}

function closeWalletModal() {
  document.getElementById('walletModal').classList.remove('active');
}

function closeWalletConnectModal() {
  document.getElementById('walletConnectModal').classList.remove('active');
}

// Connection Help Modal Functions
function showWalletHelp(walletType, event) {
  if (event) event.stopPropagation();
  closeWalletModal();
  
  let content;
  
  switch(walletType) {
    case 'metamask':
      content = `
        <div class="help-title">
          <div class="help-icon-wrapper">
            <i class="fas fa-fox help-icon"></i>
          </div>
          <span>MetaMask Connection Guide</span>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <h3>Browser Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install the MetaMask extension for Chrome, Firefox, Brave, or Edge</li>
            <li>Create a new wallet or import an existing one</li>
            <li>Click "Connect Wallet" on our site and select MetaMask</li>
            <li>Approve the connection request in the MetaMask popup</li>
            <li>Your wallet address will appear when connected</li>
          </ol>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install the MetaMask app from your app store</li>
            <li>Open our website in the MetaMask in-app browser</li>
            <li>Tap "Connect Wallet" and select MetaMask</li>
            <li>Approve the connection request in the app</li>
            <li>For direct connection, open our site via MetaMask browser</li>
          </ol>
        </div>
      `;
      break;
      
    case 'trust':
      content = `
        <div class="help-title">
          <div class="help-icon-wrapper">
            <i class="fas fa-shield-alt help-icon"></i>
          </div>
          <span>Trust Wallet Connection Guide</span>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <h3>Browser Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install Trust Wallet extension for your browser</li>
            <li>Set up your wallet and secure your recovery phrase</li>
            <li>Click "Connect Wallet" and select Trust Wallet</li>
            <li>Approve the connection request in the extension</li>
            <li>Your wallet will be connected to our dApp</li>
          </ol>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install Trust Wallet from App Store or Play Store</li>
            <li>Open our website in Trust Wallet's DApp browser</li>
            <li>Tap "Connect Wallet" and select Trust Wallet</li>
            <li>Approve the connection request in the app</li>
            <li>For WalletConnect, scan the QR code from mobile</li>
          </ol>
        </div>
      `;
      break;
      
    case 'walletconnect':
      content = `
        <div class="help-title">
          <div class="help-icon-wrapper">
            <i class="fas fa-qrcode help-icon"></i>
          </div>
          <span>WalletConnect Guide</span>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <h3>Browser Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Select WalletConnect from the wallet options</li>
            <li>Choose your preferred wallet from the list</li>
            <li>Follow the connection instructions for your wallet</li>
            <li>Approve the connection request in your wallet</li>
            <li>Your wallet will be connected to our dApp</li>
          </ol>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Make sure you have a compatible wallet installed</li>
            <li>Select WalletConnect from the wallet options</li>
            <li>Choose your wallet from the list of installed wallets</li>
            <li>Approve the connection request in your wallet app</li>
            <li>Your wallet will connect to our dApp</li>
          </ol>
        </div>
      `;
      break;
      
    case 'phantom':
      content = `
        <div class="help-title">
          <div class="help-icon-wrapper">
            <i class="fas fa-ghost help-icon"></i>
          </div>
          <span>Phantom Wallet Guide</span>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <h3>Browser Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install Phantom extension for Chrome, Brave, or Firefox</li>
            <li>Create a new wallet or import an existing one</li>
            <li>Click "Connect Wallet" and select Phantom</li>
            <li>Approve the connection request in the Phantom popup</li>
            <li>Your Solana address will connect to our dApp</li>
          </ol>
        </div>
        
        <div class="help-platform">
          <div class="platform-header">
            <div class="platform-icon">
              <i class="fas fa-mobile-alt"></i>
            </div>
            <h3>Mobile Instructions</h3>
          </div>
          <ol class="help-steps">
            <li>Install Phantom app from App Store or Play Store</li>
            <li>Open our website in Phantom's in-app browser</li>
            <li>Tap "Connect Wallet" and select Phantom</li>
            <li>Approve the connection request in the app</li>
            <li>For direct connection, open our site via Phantom browser</li>
          </ol>
        </div>
      `;
      break;
  }
  
  document.getElementById('helpContent').innerHTML = content;
  document.getElementById('helpModal').classList.add('active');
}

function closeHelpModal() {
  document.getElementById('helpModal').classList.remove('active');
}

// Main wallet connection function
async function connectWallet(walletType) {
  try {
    closeWalletModal();
    
    // Update wallet button to show loading
    const walletButton = document.getElementById('walletButton');
    const originalText = walletButton.innerHTML;
    walletButton.innerHTML = '<span class="spinner"></span> Connecting...';
    walletButton.disabled = true;
    
    if (walletType === 'metamask') {
      await connectMetaMask();
    }
    else if (walletType === 'trust') {
      await connectTrustWallet();
    }
    else if (walletType === 'walletconnect') {
      await connectWalletConnect();
    }
    else if (walletType === 'phantom') {
      await connectPhantom();
    }
  } catch (error) {
    console.error("Wallet connection error:", error);
    showWalletError("Failed to connect wallet: " + error.message);
  } finally {
    // Reset wallet button state
    setTimeout(() => {
      const walletButton = document.getElementById('walletButton');
      if (walletButton && !userWalletAddress) {
        walletButton.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
        walletButton.disabled = false;
      }
    }, 2000);
  }
}

// MetaMask connection
async function connectMetaMask() {
  if (isMobile()) {
    // Check if we're already in MetaMask browser
    const isMetaMaskBrowser = window.ethereum && window.ethereum.isMetaMask;
    
    if (isMetaMaskBrowser) {
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
        return; // Exit here to prevent redirect
      } catch (error) {
        console.error("MetaMask connection error:", error);
        showWalletError("Connection failed: " + error.message);
        return;
      }
    }
    
    // Only redirect if not in MetaMask browser
    const currentUrl = window.location.href;
    if (!currentUrl.includes('metamask')) {
      window.location.href = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}`;
    }
  } else {
    // Desktop logic remains the same
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
      throw new Error("Please install MetaMask extension");
    }
  }
}

// Trust Wallet connection
async function connectTrustWallet() {
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
        throw new Error("Failed to connect Trust Wallet");
      }
    } else {
      throw new Error("Please install Trust Wallet extension");
    }
  }
}

// WalletConnect connection with real implementation
async function connectWalletConnect() {
  try {
    // Check if WalletConnect is available
    if (typeof WalletConnect === 'undefined') {
      // Load WalletConnect library dynamically
      await loadWalletConnectLibrary();
    }

    // Initialize WalletConnect
    const walletConnect = new WalletConnect({
      bridge: "https://bridge.walletconnect.org", // WalletConnect bridge
      qrcodeModal: {
        open: (uri) => {
          openWalletConnectModal(uri);
        },
        close: () => {
          closeWalletConnectModal();
        }
      }
    });

    // Check if connection is already established
    if (!walletConnect.connected) {
      // Create new session
      await walletConnect.createSession();
    } else {
      // If already connected, use existing session
      const accounts = walletConnect.accounts;
      if (accounts && accounts.length > 0) {
        handleWalletConnection(accounts[0]);
        return;
      }
    }

    // Subscribe to connection events
    walletConnect.on("connect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Close QR code modal
      closeWalletConnectModal();

      // Get connected accounts
      const { accounts } = payload.params[0];
      handleWalletConnection(accounts[0]);

      showWalletError("WalletConnect connection established!", "success");
    });

    walletConnect.on("session_update", (error, payload) => {
      if (error) {
        throw error;
      }

      // Get updated accounts
      const { accounts } = payload.params[0];
      handleWalletConnection(accounts[0]);
    });

    walletConnect.on("disconnect", (error, payload) => {
      if (error) {
        throw error;
      }

      // Reset WalletConnect
      walletConnect = null;
      disconnectWallet();
    });

    // Store WalletConnect instance for later use
    window.walletConnect = walletConnect;

  } catch (error) {
    console.error("WalletConnect error:", error);
    
    // Fallback to QR code with wallet options
    showWalletConnectFallback();
  }
}

// Load WalletConnect library dynamically
async function loadWalletConnectLibrary() {
  return new Promise((resolve, reject) => {
    if (typeof WalletConnect !== 'undefined') {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@walletconnect/web3-provider@1.8.0/dist/umd/index.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Enhanced WalletConnect modal with real QR code
function openWalletConnectModal(uri) {
  const qrCodeElement = document.getElementById('walletConnectQrCode');
  
  // Clear previous content
  qrCodeElement.innerHTML = '';
  
  try {
    // Generate actual QR code
    if (typeof QRCode !== 'undefined') {
      // Use QRCode library if available
      new QRCode(qrCodeElement, {
        text: uri,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
    } else {
      // Fallback to simple display
      qrCodeElement.innerHTML = `
        <div style="width: 200px; height: 200px; background: white; border: 2px solid #ccc; display: flex; align-items: center; justify-content: center; font-size: 12px; text-align: center; padding: 10px; border-radius: 8px;">
          <div>
            <div style="margin-bottom: 10px;">📱 Scan with WalletConnect</div>
            <div style="font-size: 10px; color: #666; word-break: break-all; max-width: 180px;">
              ${uri.substring(0, 50)}...
            </div>
            <button onclick="copyWalletConnectUri('${uri}')" style="margin-top: 10px; padding: 5px 10px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
              Copy URI
            </button>
          </div>
        </div>
      `;
    }
    
    // Show connection instructions
    const linkElement = document.getElementById('walletConnectLink');
    if (linkElement) {
      linkElement.classList.remove('hidden');
      linkElement.innerHTML = `
        <div style="text-align: center; margin-top: 15px;">
          <p style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
            Don't have a wallet? Download one:
          </p>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button onclick="window.open('https://metamask.io/download/', '_blank')" style="padding: 8px 12px; background: #f6851b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
              MetaMask
            </button>
            <button onclick="window.open('https://trustwallet.com/', '_blank')" style="padding: 8px 12px; background: #3375bb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
              Trust Wallet
            </button>
          </div>
        </div>
      `;
    }

  } catch (error) {
    console.error("QR code generation error:", error);
    // Ultimate fallback
    qrCodeElement.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 16px; margin-bottom: 10px;">🔗 WalletConnect</div>
        <p style="font-size: 14px; color: #6b7280; margin-bottom: 15px;">
          Open your wallet app and scan QR code or use the links below:
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button onclick="window.open('https://metamask.app.link/wc?uri=${encodeURIComponent(uri)}', '_blank')" style="padding: 10px; background: #f6851b; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Open in MetaMask
          </button>
          <button onclick="window.open('https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}', '_blank')" style="padding: 10px; background: #3375bb; color: white; border: none; border-radius: 8px; cursor: pointer;">
            Open in Trust Wallet
          </button>
        </div>
      </div>
    `;
  }
  
  document.getElementById('walletConnectModal').classList.add('active');
}

// Copy WalletConnect URI to clipboard
function copyWalletConnectUri(uri) {
  navigator.clipboard.writeText(uri).then(() => {
    showWalletError("WalletConnect URI copied to clipboard!", "success");
  }).catch(() => {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = uri;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showWalletError("WalletConnect URI copied to clipboard!", "success");
  });
}

// Enhanced fallback with multiple wallet options using LOCAL ICONS
function showWalletConnectFallback() {
  const modal = document.getElementById('walletConnectModal');
  const qrContainer = document.getElementById('walletConnectQrCode');
  
  // Clear previous content
  qrContainer.innerHTML = '';
  
  // Create comprehensive wallet options with LOCAL ICONS
  const walletList = document.createElement('div');
  walletList.innerHTML = `
    <style>
      .wallet-connect-fallback {
        padding: 20px;
        text-align: center;
      }
      .fallback-title {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 15px;
        color: #1f2937;
      }
      .dark .fallback-title {
        color: #f9fafb;
      }
      .wallet-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin-bottom: 20px;
      }
      .wallet-option-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 15px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      .dark .wallet-option-card {
        background: #374151;
        border-color: #4b5563;
      }
      .wallet-option-card:hover {
        background: #e2e8f0;
        transform: translateY(-2px);
      }
      .dark .wallet-option-card:hover {
        background: #4b5563;
      }
      .wallet-icon {
        width: 40px;
        height: 40px;
        margin-bottom: 8px;
        border-radius: 10px;
        object-fit: contain;
      }
      .wallet-name {
        font-weight: 600;
        font-size: 14px;
        color: #1f2937;
      }
      .dark .wallet-name {
        color: #f9fafb;
      }
      .wallet-description {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }
    </style>

    <button class="modal-close-btn" onclick="closeWalletConnectModal()">×</button>
    
    <div class="wallet-connect-fallback">
      <div class="fallback-title">Choose Your Wallet</div>
      <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">
        Select a wallet to connect to $FLUFFI Airdrop
      </p>
      
      <div class="wallet-grid">
        <div class="wallet-option-card" onclick="connectMetaMask()">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" class="wallet-icon">
          <span class="wallet-name">MetaMask</span>
          <span class="wallet-description">Browser & Mobile</span>
        </div>
        
        <div class="wallet-option-card" onclick="connectTrustWallet()">
          <img src="Trust_Stacked Logo_Blue.png" alt="Trust Wallet" class="wallet-icon">
          <span class="wallet-name">Trust Wallet</span>
          <span class="wallet-description">Mobile</span>
        </div>
        
        <div class="wallet-option-card" onclick="connectBinanceWallet()">
          <img src="binance.png" alt="Binance" class="wallet-icon">
          <span class="wallet-name">Binance Wallet</span>
          <span class="wallet-description">Browser & Mobile</span>
        </div>
        
        <div class="wallet-option-card" onclick="window.open('https://rainbow.me/', '_blank')">
          <div class="wallet-icon" style="background: linear-gradient(45deg, #FF6B6B, #4ECDC4, #45B7D1, #96CEB4); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">🌈</div>
          <span class="wallet-name">Rainbow</span>
          <span class="wallet-description">Mobile</span>
        </div>
        
        <div class="wallet-option-card" onclick="window.open('https://argent.xyz/', '_blank')">
          <div class="wallet-icon" style="background: #FF875B; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">A</div>
          <span class="wallet-name">Argent</span>
          <span class="wallet-description">Mobile</span>
        </div>
        
        <div class="wallet-option-card" onclick="connectPhantom()">
          <img src="Phantom-Icon_App_1200x1200.png" alt="Phantom" class="wallet-icon">
          <span class="wallet-name">Phantom</span>
          <span class="wallet-description">Solana</span>
        </div>
      </div>
      
       <button onclick="closeWalletConnectModal()" style="margin-top: 15px; padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 8px; cursor: pointer; width: 100%;">
        Cancel
      </button>
      
      <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 15px;">
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          💡 <strong>Tip:</strong> Make sure your wallet is installed and you're on a supported network (BSC, Ethereum, Polygon, etc.)
        </p>
      </div>
    </div>
  `;
  
  qrContainer.appendChild(walletList);
  modal.classList.add('active');
}

// Enhanced disconnect to handle WalletConnect
async function disconnectWallet() {
  // Disconnect WalletConnect if connected
  if (window.walletConnect && window.walletConnect.connected) {
    try {
      await window.walletConnect.killSession();
    } catch (error) {
      console.error("Error disconnecting WalletConnect:", error);
    }
    window.walletConnect = null;
  }
  
  userWalletAddress = null;
  isSolanaWallet = false;
  solanaProvider = null;
  
  const walletButtons = document.getElementById('walletButtons');
  walletButtons.innerHTML = `
    <button id="walletButton" class="bg-green-700 hover:bg-green-800 text-white py-1 px-3 rounded flex items-center">
      <i class="fas fa-wallet mr-2"></i>Connect Wallet
    </button>
  `;
  
  // Re-add event listener to the new button
  const newWalletButton = document.getElementById('walletButton');
  if (newWalletButton) {
    newWalletButton.addEventListener('click', openWalletModal);
  }
  
  // Only clear walletAddress value if the element exists
  const walletAddressElement = document.getElementById('walletAddress');
  if (walletAddressElement) {
    walletAddressElement.value = '';
  }
  
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('walletAddress');
  
  // Hide rate limit message
  const rateLimitMessage = document.getElementById('rateLimitMessage');
  if (rateLimitMessage) {
    rateLimitMessage.classList.add('hidden');
  }
  
  // Enable the claim button
  const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
  
  showWalletError("Wallet disconnected", "success");
}

// Show WalletConnect fallback modal
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

// Add this new function for Binance connection
async function connectBinanceWallet() {
  try {
    closeWalletConnectModal(); // Close modal first
    
    if (window.BinanceChain) {
      const accounts = await window.BinanceChain.request({ method: 'eth_requestAccounts' });
      handleWalletConnection(accounts[0]);
    } else if (window.ethereum && window.ethereum.isBinance) {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      handleWalletConnection(accounts[0]);
    } else {
      // Only open new tab if wallet not detected
      showWalletError("Binance Wallet not detected. Opening download page...");
      setTimeout(() => {
        window.open('https://www.bnbchain.org/en/binance-wallet', '_blank');
      }, 1500);
    }
  } catch (error) {
    showWalletError("Failed to connect Binance Wallet: " + error.message);
  }
}

// Phantom connection - UPDATED FUNCTION
async function connectPhantom() {
  try {
    // Check if Phantom is installed
    if (typeof window.solana === 'undefined' || !window.solana.isPhantom) {
      if (isMobile()) {
        window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(window.location.href)}?ref=${encodeURIComponent(window.location.origin)}`;
      } else {
        showWalletError("Please install Phantom wallet extension");
        window.open('https://phantom.app/', '_blank');
      }
      return;
    }

    // Set flag
    isSolanaWallet = true;
    
    // Connect to Phantom wallet
    const response = await window.solana.connect();
    const publicKey = response.publicKey.toString();
    
    // Store Solana provider
    solanaProvider = window.solana;
    
    // Handle Solana wallet connection
    handleWalletConnection(publicKey);
    
    // Listen for account changes
    window.solana.on('accountChanged', (publicKey) => {
      if (publicKey) {
        handleWalletConnection(publicKey.toString());
      } else {
        disconnectWallet();
      }
    });
  } catch (error) {
    console.error("Phantom connection error:", error);
    showWalletError("Failed to connect Phantom wallet: " + error.message);
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
  
  // Only set walletAddress value if the element exists
  const walletAddressElement = document.getElementById('walletAddress');
  if (walletAddressElement) {
    walletAddressElement.value = address;
  }
  
  // Only set referralLink value if the element exists (for airdrop page)
  const referralLinkElement = document.getElementById('referralLink');
  if (referralLinkElement) {
    const referralLink = `https://fluffi.io/airdrop?ref=${address}`;
    referralLinkElement.value = referralLink;
  }
  
  localStorage.setItem('walletConnected', 'true');
  localStorage.setItem('walletAddress', address);
  
  // Close any open modals
  closeWalletConnectModal();
  
  showWalletError("Wallet connected successfully!", "success");
  
  // Check if this wallet has already claimed the airdrop
  checkAirdropStatus(address);
}

function disconnectWallet() {
  userWalletAddress = null;
  isSolanaWallet = false;
  solanaProvider = null;
  
  const walletButtons = document.getElementById('walletButtons');
  walletButtons.innerHTML = `
    <button id="walletButton" class="bg-green-700 hover:bg-green-800 text-white py-1 px-3 rounded flex items-center">
      <i class="fas fa-wallet mr-2"></i>Connect Wallet
    </button>
  `;
  
  // Re-add event listener to the new button
  const newWalletButton = document.getElementById('walletButton');
  if (newWalletButton) {
    newWalletButton.addEventListener('click', openWalletModal);
  }
  
  // Only clear walletAddress value if the element exists
  const walletAddressElement = document.getElementById('walletAddress');
  if (walletAddressElement) {
    walletAddressElement.value = '';
  }
  
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('walletAddress');
  
  // Hide rate limit message
  const rateLimitMessage = document.getElementById('rateLimitMessage');
  if (rateLimitMessage) {
    rateLimitMessage.classList.add('hidden');
  }
  
  // Enable the claim button
  const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  }
  
  showWalletError("Wallet disconnected", "success");
}

function showWalletError(message, type = 'error') {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.notification-toast');
  existingNotifications.forEach(n => n.remove());
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'notification-toast';
  
  // Set type-specific styles
  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };
  
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
  notification.innerHTML = `
    <div class="fixed top-20 right-4 z-50 animate-slide-in">
      <div class="${colors[type]} text-white px-6 py-4 rounded-lg shadow-xl flex items-center space-x-3 max-w-md">
        <span class="text-2xl">${icons[type]}</span>
        <div class="flex-1">
          <p class="font-semibold">${type.charAt(0).toUpperCase() + type.slice(1)}</p>
          <p class="text-sm">${message}</p>
        </div>
        <button onclick="this.closest('.notification-toast').remove()" class="ml-4 text-white hover:text-gray-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification && notification.parentNode) {
      notification.classList.add('animate-slide-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

// ========== REST OF THE AIRDROP FUNCTIONS ==========

// Check if a wallet has already claimed the airdrop
function checkAirdropStatus(walletAddress) {
  const claimedWallets = JSON.parse(localStorage.getItem('claimedWallets') || '[]');
  const messageContainer = document.getElementById('rateLimitMessage');
  
  if (!messageContainer) return;
  
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
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }
  } else {
    messageContainer.classList.add('hidden');
    
    // Enable the claim button
    const submitBtn = document.querySelector('#airdropForm button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }
  }
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
      showWalletError(`Twitter follow verified successfully for @${username}! +10,000 FLUFFI tokens earned.`, "success");
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
      showWalletError(`Telegram join verified successfully for @${username}! +10,000 FLUFFI tokens earned.`, "success");
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
        showWalletError("Retweet verified successfully! +30,000 FLUFFI tokens earned.", "success");
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
  showWalletError("Twitter follow simulated successfully!", "success");
}

function simulateTelegramJoin() {
  document.getElementById('telegramUsername').value = 'testuser';
  tasksCompleted.telegram = true;
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  updateTaskUI();
  showWalletError("Telegram join simulated successfully!", "success");
}

function simulateRetweet() {
  tasksCompleted.retweet = true;
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  updateTaskUI();
  showWalletError("Retweet simulated successfully!", "success");
}

function resetTasks() {
  tasksCompleted = {
    twitter: false,
    telegram: false,
    retweet: false
  };
  localStorage.setItem('completedTasks', JSON.stringify(tasksCompleted));
  
  // Reset input fields
  document.getElementById('twitterUsername').value = '';
  document.getElementById('telegramUsername').value = '';
  
  // Re-enable input fields
  document.getElementById('twitterUsername').disabled = false;
  document.getElementById('telegramUsername').disabled = false;
  
  // Reset verification buttons
  const twitterBtn = document.getElementById('verifyTwitterBtn');
  const telegramBtn = document.getElementById('verifyTelegramBtn');
  const retweetBtn = document.getElementById('verifyRetweetBtn');
  
  if (twitterBtn) {
    twitterBtn.textContent = 'Verify';
    twitterBtn.classList.remove('completed');
    twitterBtn.disabled = false;
    twitterBtn.onclick = verifyTwitterFollow;
  }
  
  if (telegramBtn) {
    telegramBtn.textContent = 'Verify';
    telegramBtn.classList.remove('completed');
    telegramBtn.disabled = false;
    telegramBtn.onclick = verifyTelegramJoin;
  }
  
  if (retweetBtn) {
    retweetBtn.textContent = 'Verify';
    retweetBtn.classList.remove('completed');
    retweetBtn.disabled = false;
    retweetBtn.onclick = verifyRetweet;
  }
  
  updateTaskUI();
  showWalletError("All tasks have been reset successfully!", "success");
}

function updateTaskUI() {
  // Update checkboxes
  document.getElementById('task1').checked = tasksCompleted.twitter;
  document.getElementById('task2').checked = tasksCompleted.telegram;
  document.getElementById('task3').checked = tasksCompleted.retweet;
  
  // Update status text
  document.getElementById('twitterStatus').textContent = tasksCompleted.twitter ? '(Verified)' : '(Not verified)';
  document.getElementById('twitterStatus').className = tasksCompleted.twitter ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  document.getElementById('telegramStatus').textContent = tasksCompleted.telegram ? '(Verified)' : '(Not verified)';
  document.getElementById('telegramStatus').className = tasksCompleted.telegram ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  document.getElementById('retweetStatus').textContent = tasksCompleted.retweet ? '(Verified)' : '(Not verified)';
  document.getElementById('retweetStatus').className = tasksCompleted.retweet ? 'text-sm task-completed' : 'text-sm task-incomplete';
  
  // Update verification buttons
  const twitterBtn = document.getElementById('verifyTwitterBtn');
  const telegramBtn = document.getElementById('verifyTelegramBtn');
  const retweetBtn = document.getElementById('verifyRetweetBtn');
  
  if (tasksCompleted.twitter && twitterBtn) {
    twitterBtn.textContent = 'Verified';
    twitterBtn.classList.add('completed');
    twitterBtn.disabled = true;
    twitterBtn.onclick = null;
    document.getElementById('twitterUsername').disabled = true;
  } else if (twitterBtn) {
    twitterBtn.textContent = 'Verify';
    twitterBtn.classList.remove('completed');
    twitterBtn.disabled = false;
    twitterBtn.onclick = verifyTwitterFollow;
  }
  
  if (tasksCompleted.telegram && telegramBtn) {
    telegramBtn.textContent = 'Verified';
    telegramBtn.classList.add('completed');
    telegramBtn.disabled = true;
    telegramBtn.onclick = null;
    document.getElementById('telegramUsername').disabled = true;
  } else if (telegramBtn) {
    telegramBtn.textContent = 'Verify';
    telegramBtn.classList.remove('completed');
    telegramBtn.disabled = false;
    telegramBtn.onclick = verifyTelegramJoin;
  }
  
  if (tasksCompleted.retweet && retweetBtn) {
    retweetBtn.textContent = 'Verified';
    retweetBtn.classList.add('completed');
    retweetBtn.disabled = true;
    retweetBtn.onclick = null;
  } else if (retweetBtn) {
    retweetBtn.textContent = 'Verify';
    retweetBtn.classList.remove('completed');
    retweetBtn.disabled = false;
    retweetBtn.onclick = verifyRetweet;
  }
}

// Clear rate limit for development
function clearRateLimit() {
  localStorage.removeItem('claimedWallets');
  showWalletError("Rate limit cleared. All wallets can now claim the airdrop again.", "success");
  
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
    showWalletError(`🎉 Airdrop claimed successfully! You earned ${bonusTokens} bonus FLUFFI tokens. Your tokens will be distributed after the presale ends.`, "success");
    
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
