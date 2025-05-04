const stripe = Stripe("pk_test_123456789"); 
const elements = stripe.elements();

const style = {
  base: {
    color: "#fff",
    fontSize: "16px",
    "::placeholder": { color: "#888" },
  },
  invalid: {
    color: "#fa755a",
  }
};

let gUsername = "";
let gEmail = "";
let gPasscode = "";

window.addEventListener("DOMContentLoaded", () => {
    gUsername = localStorage.getItem('userName') || "Guest";
    
    console.log("Retrieved username from localStorage:", gUsername);

    gEmail = localStorage.getItem('userEmail') || "No email";
    gPasscode = localStorage.getItem('userPassword') || "No password";
    const usernameGreetingElement = document.getElementById("username-greeting");
    usernameGreetingElement.innerText = `${gUsername}?`;

});

// Create Elements
const cardNumber = elements.create("cardNumber", { style });
cardNumber.mount("#card-number");

const cardExpiry = elements.create("cardExpiry", { style });
cardExpiry.mount("#card-expiry");

const cardCvc = elements.create("cardCvc", { style });
cardCvc.mount("#card-cvc");

document.getElementById("payment-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const cardholderName = document.getElementById("cardholder-name").value;

  const { paymentMethod, error } = await stripe.createPaymentMethod({
    type: "card",
    card: cardNumber,
    billing_details: {
      name: cardholderName,
    },
  });

  if (error) {
    alert("Payment error: " + error.message);
  } else {
    alert("Payment Method Created: " + paymentMethod.id);
    // Send paymentMethod.id to your backend here
  }
});
