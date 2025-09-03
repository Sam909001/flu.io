 <!-- Wallet Connect Modal -->
  <div id="walletModal" class="wallet-modal">
    <div class="wallet-modal-content dark:bg-gray-800 transition-colors duration-300">
      <div class="wallet-header">
        <h3 class="text-xl font-bold transition-colors duration-300">Connect Wallet</h3>
        <span class="wallet-close" onclick="closeWalletModal()">&times;</span>
      </div>
      <div class="wallet-option" onclick="connectWallet('metamask')">
        <div class="flex items-center w-full">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask">
          <span class="ml-3 transition-colors duration-300">MetaMask</span>
        </div>
        <div class="wallet-help-btn" onclick="showConnectionHelp('metamask', event)">?</div>
      </div>
      <div class="wallet-option" onclick="connectWallet('trust')">
        <div class="flex items-center w-full">
          <img src="https://trustwallet.com/assets/images/media/assets/TWT.png" alt="Trust Wallet">
          <span class="ml-3 transition-colors duration-300">Trust Wallet</span>
        </div>
        <div class="wallet-help-btn" onclick="showConnectionHelp('trust', event)">?</div>
      </div>
      <div class="wallet-option" onclick="connectWallet('walletconnect')">
        <div class="flex items-center w-full">
          <img src="https://altcoinsbox.com/wp-content/uploads/2023/04/wallet-connect-logo.png" alt="WalletConnect">
          <span class="ml-3 transition-colors duration-300">WalletConnect</span>
        </div>
        <div class="wallet-help-btn" onclick="showConnectionHelp('walletconnect', event)">?</div>
      </div>

   <div class="wallet-option" onclick="connectWallet('phantom')">
  <div class="flex items-center w-full">
    <img src="Phantom-Icon_App_1200x1200.png" alt="Phantom" class="w-6 h-6">
    <span class="ml-3 transition-colors duration-300">Phantom</span>
  </div>
  <div class="wallet-help-btn" onclick="showConnectionHelp('phantom', event)">?</div>
</div>
    </div>
  </div>

  <!-- WalletConnect QR Code Modal -->
  <div id="walletConnectModal" class="wallet-connect-modal">
    <div class="wallet-connect-content dark:bg-gray-800 transition-colors duration-300">
      <span class="wallet-connect-close" onclick="closeWalletConnectModal()">&times;</span>
      <h3 class="text-lg font-bold mb-2 transition-colors duration-300">Scan with WalletConnect</h3>
      <p class="text-gray-600 dark:text-gray-300 text-sm mb-4 transition-colors duration-300">Use your mobile wallet to scan this QR code</p>
      <div id="walletConnectQrCode"></div>
      <p id="walletConnectLink" class="wallet-connect-link hidden">Or open in wallet app</p>
    </div>
  </div>
  
  <!-- Connection Help Modal -->
  <div id="connectionHelpModal" class="help-modal">
    <div class="help-modal-content dark:bg-gray-800 transition-colors duration-300">
      <span class="help-close" onclick="closeHelpModal()">&times;</span>
      <div id="helpContent"></div>
    </div>
  </div>

  <!-- JavaScript Libraries -->
  <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>

  <script>
    // Global variables
    let userWalletAddress = null;
    let tasksCompleted = {
      twitter: false,
      telegram: false,
      retweet: false
    };
    let countdownInterval = null;
    
    // For development - show dev section if URL has ?dev=true
    if (window.location.search.includes('dev=true')) {
      document.getElementById('devSection').classList.remove('hidden');
    }

    document.addEventListener('DOMContentLoaded', function() {
      // Initialize dark mode
      const darkMode = localStorage.getItem('darkMode');
      const isDarkMode = darkMode === 'true' || 
                        (darkMode === null && 
                        window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDarkMode) {
        document.documentElement.classList.add('dark');
        document.getElementById('darkModeIcon').textContent = '☀️';
      } else {
        document.documentElement.classList.remove('dark');
        document.getElementById('darkModeIcon').textContent = '🌙';
      }
      
      // Setup form submission
      document.getElementById('airdropForm').addEventListener('submit', function(e) {
        e.preventDefault();
        claimAirdrop();
      });
      
      // Setup wallet button
      document.getElementById('walletButton').addEventListener('click', openWalletModal);
      
      // Check if wallet is already connected
      if (localStorage.getItem('walletConnected') === 'true' && localStorage.getItem('walletAddress')) {
        handleWalletConnection(localStorage.getItem('walletAddress'));
        
        // Check if this wallet has already claimed the airdrop
        checkAirdropStatus(localStorage.getItem('walletAddress'));
      }
      
      // Initialize countdown timer
      initializeCountdown();
      
      // Load completed tasks from localStorage
      const savedTasks = localStorage.getItem('completedTasks');
      if (savedTasks) {
        tasksCompleted = JSON.parse(savedTasks);
        updateTaskUI();
      }
      
      // Create floating particles
      createParticles();
    });

    // Create floating particles effect
    function createParticles() {
      const particlesContainer = document.getElementById('particles');
      const colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random properties
        const size = Math.random() * 15 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        
        particlesContainer.appendChild(particle);
      }
    }

    // Timer functions
    function initializeCountdown() {
      let endTime = localStorage.getItem('airdropEndTime');
      
      if (!endTime) {
        endTime = Date.now() + 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('airdropEndTime', endTime);
      }
      
      startCountdown(parseInt(endTime));
    }
    
    function startCountdown(endTime) {
      if (countdownInterval) {
        clearInterval(countdownInterval);
      }
      
      updateTimer(endTime);
      
      countdownInterval = setInterval(() => {
        updateTimer(endTime);
      }, 1000);
    }
    
    function updateTimer(endTime) {
      const now = Date.now();
      const distance = endTime - now;
      
      if (distance < 0) {
        clearInterval(countdownInterval);
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      document.getElementById('days').textContent = days.toString().padStart(2, '0');
      document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
      document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
      document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
    }
    
    function resetTimer() {
      const newEndTime = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days from now
      localStorage.setItem('airdropEndTime', newEndTime.toString());
      startCountdown(newEndTime);
      alert("Timer has been reset to 7 days");
    }
    
    // For development - set custom timer
    function setTimer(hours, minutes, seconds) {
      const endTime = Date.now() + (hours * 60 * 60 * 1000) + (minutes * 60 * 1000) + (seconds * 1000);
      localStorage.setItem('airdropEndTime', endTime.toString());
      startCountdown(endTime);
    }

    // Wallet connection functions
    function openWalletModal() {
      document.getElementById('walletModal').classList.add('active');
    }

    function closeWalletModal() {
      document.getElementById('walletModal').classList.remove('active');
    }
    
    function openWalletConnectModal(uri) {
      const modal = document.getElementById('walletConnectModal');
      const linkElement = document.getElementById('walletConnectLink');
      
      document.getElementById('walletConnectQrCode').innerHTML = '';
      
      QRCode.toCanvas(document.getElementById('walletConnectQrCode'), uri, {
        width: 200,
        margin: 2,
        color: {
          dark: document.documentElement.classList.contains('dark') ? '#000000' : '#000000',
          light: '#00000000'
        }
      });
      
      if (isMobile()) {
        linkElement.classList.remove('hidden');
        linkElement.onclick = function() {
          window.location.href = uri;
        };
      } else {
        linkElement.classList.add('hidden');
      }
      
      modal.classList.add('active');
    }

    function closeWalletConnectModal() {
      document.getElementById('walletConnectModal').classList.remove('active');
    }
    
    // Connection Help Modal Functions
    function showConnectionHelp(walletType, event) {
      event.stopPropagation();
      closeWalletModal();
      
      let title, content;
      
      switch(walletType) {
        case 'metamask':
          title = "How to Connect MetaMask";
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
          title = "How to Connect Trust Wallet";
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
          title = "How to Use WalletConnect";
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
                <li>A QR code will appear on your screen</li>
                <li>Open your mobile wallet app (MetaMask, Trust, etc.)</li>
                <li>Find the WalletConnect scanner in your wallet</li>
                <li>Scan the QR code to connect your wallet</li>
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
          title = "How to Connect Phantom Wallet";
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
      document.getElementById('connectionHelpModal').classList.add('active');
    }
    
    function closeHelpModal() {
      document.getElementById('connectionHelpModal').classList.remove('active');
    }

    async function connectWallet(walletType) {
      try {
        closeWalletModal();
        
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
  </script>
  <script>
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

  // Initialize when page loads
  document.addEventListener('DOMContentLoaded', function() {
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
</script>
