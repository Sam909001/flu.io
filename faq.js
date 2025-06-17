// FAQ Toggle Functionality
document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const answer = button.nextElementSibling;
    button.classList.toggle('active');
    answer.classList.toggle('show');
  });
});
