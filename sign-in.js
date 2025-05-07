window.onload = function () {
    gapi.load('auth2', function () {
        gapi.auth2.init({
            client_id: '83470708869-m1ptobd92on953looem9v9rimo24gtr4.apps.googleusercontent.com'
        }).then(function () {
            // Safe to use Google Sign-In now
            document.getElementById("custom-google-btn").addEventListener("click", function () {
                const authInstance = gapi.auth2.getAuthInstance();
                if (!authInstance) {
                    console.error("Google Auth not initialized");
                    showNotification("Google Sign-In failed to initialize.", "error");
                    return;
                }

                authInstance.signIn().then(function (googleUser) {
                    const profile = googleUser.getBasicProfile();
                    const idToken = googleUser.getAuthResponse().id_token;

                    localStorage.setItem("userName", profile.getName());
                    localStorage.setItem("userEmail", profile.getEmail());
                    localStorage.setItem("userPassword", ""); 
                    localStorage.setItem("authProvider", "google");

                    window.open('checkout.html', '_blank');
                    document.getElementById("loginModal").style.display = "none";
                }).catch(function (error) {
                    console.error("Google Sign-In error:", error);
                    showNotification("Google Sign-In failed.", "error");
                });
            });
        }).catch(function (error) {
            console.error("Google Auth initialization failed:", error);
        });
    });
};

document.getElementById("sign-in").addEventListener("click", (event) => {
    event.preventDefault();
    document.getElementById("loginModal").style.display = "block";
});

document.getElementById("closeModal").addEventListener("click", () => {
    document.getElementById("loginModal").style.display = "none";
});

function validatePassword(password) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}:"<>?;.,])(?=.{8,})/;
    return regex.test(password);
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const messageElem = document.getElementById('notification-message');
    messageElem.textContent = message;
    notification.classList.remove('success', 'error');
    notification.classList.add(type, 'show');
    setTimeout(() => notification.classList.remove('show'), 3000);
}

document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const username = document.getElementById("name-input").value;
    const email = document.getElementById("email-input").value;
    const password = document.getElementById("password-input").value;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
        showNotification("Please enter a valid email address.", "error");
        return;
    }

    if (!validatePassword(password)) {
        showNotification("Password must be at least 8 characters long, include one uppercase, one lowercase, one number, and one special character.", "error");
        return;
    }

    localStorage.setItem("userName", username);
    localStorage.setItem("userEmail", email);
    localStorage.setItem("userPassword", password);
    localStorage.setItem("authProvider", "local");

    window.open('checkout.html', '_blank');
    document.getElementById("loginModal").style.display = "none"; 
});

document.getElementById("custom-google-btn").addEventListener("click", function () {
    const authInstance = gapi.auth2.getAuthInstance();
    if (!authInstance) {
        console.error("Google Auth not initialized.");
        return;
    }

    authInstance.signIn().then(function (googleUser) {
        // Using currentUser.get() to access profile
        const profile = googleUser.getBasicProfile();
        const idToken = googleUser.getAuthResponse().id_token;

        // Alternatively, you can use this if getBasicProfile() doesn't work:
        // const profile = gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
        
        localStorage.setItem("userName", profile.getName());
        localStorage.setItem("userEmail", profile.getEmail());
        localStorage.setItem("userPassword", ""); // Don't store password for Google
        localStorage.setItem("authProvider", "google");

        window.open('checkout.html', '_blank');
        document.getElementById("loginModal").style.display = "none"; 
    }).catch(function (error) {
        console.error("Google Sign-In error:", error);
    });
});