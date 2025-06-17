// Set presale end date (YYYY/MM/DD)
const endDate = new Date('2025/06/20').getTime();

const timer = setInterval(() => {
  const now = new Date().getTime();
  const distance = endDate - now;
  
  document.getElementById('days').innerText = Math.floor(distance / (1000 * 60 * 60 * 24));
  document.getElementById('hours').innerText = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  document.getElementById('minutes').innerText = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  document.getElementById('seconds').innerText = Math.floor((distance % (1000 * 60)) / 1000);
}, 1000);
