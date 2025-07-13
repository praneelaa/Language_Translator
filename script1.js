const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');
const googleSignup = document.querySelector('.google-signup');
const googleSignin = document.querySelector('.google-signin');
const googleModal = document.getElementById('googleModal');
const closeModal = document.querySelector('.close');
const continueGoogle = document.getElementById('continueGoogle');

// Toggle between sign-in and sign-up forms
registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Google Signup Modal
googleSignup.addEventListener('click', (event) => {
    event.preventDefault();
    googleModal.style.display = "block";
});

// Google Signin Modal
googleSignin.addEventListener('click', (event) => {
    event.preventDefault();
    googleModal.style.display = "block";
});

// Close the modal
closeModal.addEventListener('click', () => {
    googleModal.style.display = "none";
});

// Continue with Google
continueGoogle.addEventListener('click', () => {
    googleModal.style.display = "none";
    // Redirect to Google OAuth with prompt=consent to force login each time
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?client_id=912503871811-1p8b16dqbf0jhc2m9kpmr9p9leptii0g.apps.googleusercontent.com&redirect_uri=http://localhost:3002/oauth2callback&response_type=code&scope=email profile&prompt=consent&access_type=offline&include_granted_scopes=true';
});


// Close the modal if clicking outside of it
window.onclick = function(event) {
    if (event.target == googleModal) {
        googleModal.style.display = "none";
    }
}
