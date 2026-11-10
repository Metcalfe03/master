document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const message = document.getElementById("formMessage");
  message.classList.remove("d-none");

  this.reset();
});