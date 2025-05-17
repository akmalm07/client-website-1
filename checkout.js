const BACKEND_URL = 'https://no-licence-user-db-manager-runner-83470708869.us-central1.run.app'; 

window.onload = async () => {
    const userId = localStorage.getItem('userId'); // Replace with your actual way of getting the user ID
    const messageDiv = document.getElementById('subscription-status'); // Assuming you have a div with this ID

    if (!userId) {
        console.log("User ID not found.");
        if (messageDiv) {
            messageDiv.textContent = "User not logged in.";
        }
        return;
    }

    try {
        const response = await fetch(`${BACKEND_URL}/users/${userId}/is_subscribed`, {
            method: 'PUT', // Changed method to GET
            headers: {
                'Content-Type': 'application/json',
            },
        });

      
            const data = await response.json();
            console.log("Subscription Status:", data);
            if (messageDiv) {
                if (data.subscribed === "True") { // Backend now returns "True" or "False" as strings
                    messageDiv.textContent = "You are currently subscribed!";
                } else {
                    messageDiv.textContent = "You are not currently subscribed.";
                }
            }

            console.error("Failed to fetch subscription status:", response.status);
            if (messageDiv) {
                messageDiv.textContent = "Failed to check subscription status.";
            }

    } catch (error) {
        console.error("Error fetching subscription status:", error);
        if (messageDiv) {
            messageDiv.textContent = "Error connecting to the server.";
        }
    }
};

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
let gUserId = "";
let gUsername = "";
let gEmail = "";
let gPasscode = "";


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

            const subscribeUrl = `${BACKEND_URL}/users/${userId}/subscribe`; 

            try {
                const response = await fetch(subscribeUrl, {
                    method: 'SUBSCRIBE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: gEmail,
                        payment_method: paymentMethod.id, 
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    showNotification(`Successfully subscribed. Subscription ID: ${data.subscription_id}`, "success");
                    errorDiv.textContent = '';
                    // Optionally redirect the user or update the UI
                } else {
                    showNotification(`Subscription failed: ${data.error || 'An error occurred during subscription.'}`, "error");
                    console.error("Subscription error:", data);
                }

            } catch (error) {
                console.error("Error calling subscribe endpoint:", error);
                showNotification("Failed to connect to the server for subscription.", "error");
            }
    }
});


document.getElementById("paypal-button").addEventListener("click", async (e) => {
    e.preventDefault();

    const userId = getUserId(); // Replace with your actual way of getting the user ID
    const userEmail = getUserEmail(); // Replace with your actual way of getting the user email

    if (!userId) {
        showNotification("User ID not found. Please log in.", "error");
        return;
    }

    const subscribeUrl = `${BACKEND_URL}/users/${userId}/create-paypal-intent`; // New backend endpoint

    try {
        const response = await fetch(subscribeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: userEmail }), // Include email for PayPal setup
        });

        const data = await response.json();

        if (response.ok && data.client_secret) {
            // Redirect the user to PayPal to authorize the payment
            stripe.confirmPayment({
                clientSecret: data.client_secret,
                confirmParams: {
                    return_url: window.location.href, // Or your desired return URL
                },
            })
            .then(function(result) {
                if (result.error) {
                    showNotification(`PayPal payment failed: ${result.error.message}`, "error");
                } else {
                    // The user has authorized the payment on PayPal
                    // You might want to call another backend endpoint to finalize the subscription
                    showNotification("PayPal payment authorized. Processing subscription...", "success");
                    console.log("PayPal PaymentIntent:", result.paymentIntent);
                    finalizeSubscriptionOnBackend(userId, result.paymentIntent.id);
                }
            });
        } else {
            showNotification(`Failed to initiate PayPal: ${data.error || 'An error occurred.'}`, "error");
            console.error("Failed to initiate PayPal:", data);
        }

    } catch (error) {
        console.error("Error calling create-paypal-intent endpoint:", error);
        showNotification("Failed to connect to the server to initiate PayPal.", "error");
    }
});

async function finalizeSubscriptionOnBackend(userId, paymentIntentId) {
    const finalizeUrl = `${BACKEND_URL}/users/${userId}/finalize-paypal-subscription`;

    try {
        const response = await fetch(finalizeUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ payment_intent_id: paymentIntentId }),
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(`Subscription successful! Subscription ID: ${data.subscription_id}`, "success");
            console.log("Final Subscription Data:", data);
            // Optionally redirect or update UI
        } else {
            showNotification(`Failed to finalize subscription: ${data.error || 'An error occurred.'}`, "error");
            console.error("Failed to finalize subscription:", data);
        }

    } catch (error) {
        console.error("Error calling finalize-paypal-subscription endpoint:", error);
        showNotification("Failed to connect to the server to finalize subscription.", "error");
    }
}

/*
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
}*/
