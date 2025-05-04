
document.getElementById("sign-in").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("loginModal").style.display = "block";
});

// Close modal when clicking the close button
document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});

// Password validation function
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

// Handle login form submission
document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("name-input").value;
    console.log(username)
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    // Validate password
    if (!validatePassword(password)) {
        showNotification("Password must be at least 8 characters long, include one uppercase letter, one lowercase letter, one number, and one special character.", "error");
        return;
    }

    // Check if the email is valid (this is a simple regex for demonstration)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address.", "error");
        return;
    }


    localStorage.setItem("userName", username);

    console.log(username);

    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);

    window.open('checkout.html', '_blank');
    document.getElementById("loginModal").style.display = "none"; 
});

// Google Sign-In logic
function onSignIn(googleUser) {
    var profile = googleUser.getBasicProfile();
    var idToken = googleUser.getAuthResponse().id_token;

    // Store Google User Info in localStorage
    localStorage.setItem("userName", profile.getName());
    localStorage.setItem("userEmail", profile.getEmail());
    localStorage.setItem("userName", profile.getName());

    window.open('checkout.html', '_blank');
    document.getElementById("loginModal").style.display = "none"; 
}
