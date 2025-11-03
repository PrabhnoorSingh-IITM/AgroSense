// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDLo9IsiIVdIMZlQqz8JEVhRrUZt5BHAQw",
  authDomain: "agrosense-e00de.firebaseapp.com",
  databaseURL: "https://agrosense-e00de-default-rtdb.firebaseio.com",
  projectId: "agrosense-e00de",
  storageBucket: "agrosense-e00de.firebasestorage.app",
  messagingSenderId: "674846785029",
  appId: "1:674846785029:web:9b6860a799cb396678a66c",
  measurementId: "G-3LQWTZK219"
};
firebase.initializeApp(firebaseConfig);e

const auth = firebase.auth();

// Auth State Check (Protect Dashboard)
auth.onAuthStateChanged((user) => {
  const path = window.location.pathname;
  if (!user && path.includes("index.html")) {
    window.location.href = "login.html"; // redirect if not logged in
  }
});

// Logout Button
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    auth.signOut()
      .then(() => {
        alert('Logged out successfully!');
        window.location.href = 'login.html';
      })
      .catch(error => console.error('Logout error:', error));
  });
}

// LOGIN PAGE
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
      .then(() => window.location.href = "index.html")
      .catch(err => {
        document.getElementById('login-error').textContent = err.message;
      });
  });
}

// REGISTER PAGE
const regForm = document.getElementById('register-form');
if (regForm) {
  regForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    auth.createUserWithEmailAndPassword(email, password)
      .then(() => window.location.href = "index.html")
      .catch(err => {
        document.getElementById('register-error').textContent = err.message;
      });
  });
}
