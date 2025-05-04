

const modal = document.getElementById("loginModal");
const signInBtn = document.getElementById("sign-in");
const closeModalBtn = document.getElementById("closeModal");

signInBtn.addEventListener("click", (e) => {
  console.log("hello");
  e.preventDefault();
  modal.classList.toggle("open");
});

closeModalBtn.addEventListener("click", () => {
  modal.classList.remove("open");
});

window.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.remove("open");
  }
});
