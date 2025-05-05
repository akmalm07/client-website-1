const stripe = Stripe("pk_test_123456789");  // Replace with your real public key
const elements = stripe.elements();

// Stripe styling
const style = {
  base: {
    color: '#ffffff', // white text
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    fontSmoothing: 'antialiased',
    fontSize: '16px',
    '::placeholder': {
      color: '#888',
    },
  },
  invalid: {
    color: '#ffffff',
    iconColor: '#f55231', 
  },
};

// Globals for user info
let gUsername = "";
let gEmail = "";
let gPasscode = "";


function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?;.,])(?=.{8,})/;
    return regex.test(password);
}

// Function to display the notification
function showNotification(message, type) {
    const notification = document.getElementById('password-notification');
    const notificationMessage = document.getElementById('notification-message');

    notificationMessage.textContent = message; 
    notification.classList.remove('success', 'error');  
    notification.classList.add(type);  
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show'); 
    }, 3000);
}




// On page load, get user info
window.addEventListener("DOMContentLoaded", () => {
    gUsername = localStorage.getItem('userName') || "Guest";
    gEmail = localStorage.getItem('userEmail') || "No email";
    gPasscode = localStorage.getItem('userPassword') || "";

    const usernameGreetingElement = document.getElementById("username-greeting");
    if (usernameGreetingElement) {
        usernameGreetingElement.innerText = `${gUsername}`;
    }

    if (!validatePassword(gPasscode)) {
        showNotification("Weak password detected. Please update it!", "error");
    } else {
        showNotification(`Welcome, ${gUsername}!`, "success");
    }
});

// Stripe elements mounting
const cardNumber = elements.create("cardNumber", { style });
cardNumber.mount("#card-number");

const cardExpiry = elements.create("cardExpiry", { style });
cardExpiry.mount("#card-expiry");

const cardCvc = elements.create("cardCvc", { style });
cardCvc.mount("#card-cvc");

// Form submission
document.getElementById("payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const cardholderName = document.getElementById("cardholder-name").value.trim();
    if (!cardholderName) {
        showNotification("Please enter the cardholder's name.", "error");
        return;
    }

    if (!validatePassword(gPasscode)) {
        showNotification("Your saved password is too weak. Cannot proceed.", "error");
        return;
    }

    const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardNumber,
        billing_details: { name: cardholderName },
    });

    if (error) {
        showNotification(`Payment error: ${error.message}`, "error");
    } else {
        showNotification("Payment Method Created Successfully!", "success");
        console.log("Payment Method ID:", paymentMethod.id);
        // TODO: send to backend
    }
});

// Password validation function
function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?;.,])(?=.{8,})/;
    return regex.test(password);
}

// Unified notification system
function showNotification(message, type) {
    const notification = document.getElementById('password-notification');
    const notificationMessage = document.getElementById('notification-message');

    if (!notification || !notificationMessage) {
        console.warn("Notification container not found.");
        return;
    }

    notificationMessage.textContent = message;
    notification.classList.remove('success', 'error');
    notification.classList.add(type);
    notification.classList.add('show');

    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}
