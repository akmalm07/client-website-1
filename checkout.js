const BACKEND_URL = 'https://no-licence-user-db-manager-runner-83470708869.us-central1.run.app'; 

window.onload = async () => {
    const userId = localStorage.getItem('userId'); // Replace with your actual way of getting the user ID

    if (!userId) {
        console.log("User ID not found.");
        return;
    }
};
/*
const stripe = Stripe("pk_live_51QtvdLRx1JEwxzyrXXSMeyapMysM7lSbO2BLhWXSoIrA1ZzUqWlg7VcwxKtxSwg886f1iRfLNbJC32XgN4bIk39400tJL6X6nK"); 
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
*/


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




/*
// Stripe elements mounting
const cardNumber = elements.create("cardNumber", { style });
cardNumber.mount("#card-number");

const cardExpiry = elements.create("cardExpiry", { style });
cardExpiry.mount("#card-expiry");

const cardCvc = elements.create("cardCvc", { style });
cardCvc.mount("#card-cvc"); 
*/

document.getElementById("payment-button").addEventListener("click", async (e) => {
    e.preventDefault();

    // Open a blank window to avoid popup blockers
    const newWindow = window.open("about:blank");

    // Show a loading screen in the new window
    newWindow.document.write(`
      <html>
        <head>
          <title>Redirecting...</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
            .loader {
              border: 8px solid #f3f3f3;
              border-radius: 50%;
              border-top: 8px solid #3498db;
              width: 60px;
              height: 60px;
              animation: spin 1s linear infinite;
              margin: 0 auto;
            }
            @keyframes spin {
              0% { transform: rotate(0deg);}
              100% { transform: rotate(360deg);}
            }
          </style>
        </head>
        <body>
          <h2>Redirecting to payment page...</h2>
          <div class="loader"></div>
        </body>
      </html>
    `);

    try {
        const userId = localStorage.getItem("userId");
        const email = localStorage.getItem("userEmail");

        const response = await fetch(`${BACKEND_URL}/users/${userId}/subscribe_url`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': userId,
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok && data.paymentLinkUrl) {
            newWindow.location.href = data.paymentLinkUrl;
        } else {
            newWindow.close();
            showNotification(`Failed to start checkout: ${data.error || 'Unknown error'}`, "error");
            alert(`Failed to start checkout: ${data.error || 'Unknown error'}`);
        }

    } catch (err) {
        newWindow.close();
        alert("Network error. Please try again.");
        console.error("Subscription error:", err);
    }
});





// Form submission
/*
document.getElementById("payment-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const newWindow = window.open('about:blank'); 

    newWindow.document.write(`
  <html>
    <head>
      <title>Please wait...</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
        .loader {
          border: 8px solid #f3f3f3;
          border-radius: 50%;
          border-top: 8px solid #3498db;
          width: 60px;
          height: 60px;
          animation: spin 1s linear infinite;
          margin: 0 auto;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      </style>
    </head>
    <body>
      <h2>Please wait while we process your payment...</h2>
      <div class="loader"></div>
    </body>
  </html>
`);

    const cardholderName = document.getElementById("cardholder-name").value.trim();
    if (!cardholderName) {
        showNotification("Please enter the cardholder's name.", "error");
        newWindow.close();
        return;
    }

    const { paymentMethod, error: pmError } = await stripe.createPaymentMethod({
        type: "card",   
        card: cardNumber,
        billing_details: { name: cardholderName },
    });

    email = localStorage.getItem("userEmail");
    

    if (pmError) {
        newWindow.close();
        showNotification(`Payment error: ${error.message}`, "error");
    } 
    else 
    {
        showNotification("Payment Method Created Successfully!", "success");
        console.log("Payment Method ID:", paymentMethod.id);
        
        const userId = localStorage.getItem("userId");
        try {
            const response = await fetch(`${BACKEND_URL}/users/${userId}/subscribe`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': userId,
                },
                body: JSON.stringify({
                    "email": email,
                    "payment_method_id": paymentMethod.id, 
                }),
            });
            const data = await response.json();


            if (!response.ok) {
                // Check if the error is the one to ignore
                if (data.error && data.error.includes("payment_intent")) {
                    console.log("Ignoring payment_intent error, continuing...");
                } else {
                    newWindow.close();
                    showNotification(`Subscription failed: ${data.error || 'An error occurred during subscription.'}`, "error");
                    console.error("Subscription error:", data);
                    //return;
                }
            }

            const clientSecret = data.clientSecret;

            console.log("client secret is: " + clientSecret);
            if (!clientSecret) {
                newWindow.close();
                showNotification("No client secret received from server. Cannot complete payment.", "error");
                return;
            }

            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: paymentMethod.id,
            });

            if (result.error) {
                console.log("ConfirmCard did not approve me");
                newWindow.close();
                showNotification(`Payment failed: ${result.error.message}`, "error");
                console.error("Stripe payment error:", result.error);
                return;
            }
        

            
            if (result.paymentIntent && result.paymentIntent.status === "succeeded") {
                console.log("I was here Hooray!!"); 
                // Only confirm subscription now
                const confirmResponse = await fetch(`https://no-licence-user-db-manager-runner-83470708869.us-central1.run.app/users/${userId}/confirm_subscription`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": userId // or bearer token if you're using one
                    }
                });

                const confirmData = await confirmResponse.json();
                if (!confirmResponse.ok) {
                    console.error("Subscription confirm failed:", confirmData.error);
                    showNotification("Subscription confirmation failed.", "error");

                } else {
                    console.log("Subscription confirmed:", confirmData.message);
                    showNotification(`Successfully subscribed. Subscription ID: ${data.subscription_id}`, "success");
                    newWindow.location.href = 'exclusive_content_page.html';            
                }
            }
        } 
        catch (error) {
            newWindow.close();
            console.error("Error calling subscribe endpoint:", error);
            showNotification("Failed to connect to the server for subscription.", "error");
        }
    }
});
*/


/*
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
