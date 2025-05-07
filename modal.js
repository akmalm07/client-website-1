

const modal = document.getElementById("loginModal");
const signInBtn = document.getElementById("sign-in");
const closeModalBtn = document.getElementById("closeModal");

signInBtn.addEventListener("click", (e) => {
  e.preventDefault();

  fetch("https://no-licence-user-db-manager-runner-83470708869.us-central1.run.app/api")
  .then(res => res.text())
  .then(text => console.log(text));

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
