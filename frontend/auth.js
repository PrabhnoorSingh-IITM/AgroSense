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
// Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Authentication instance
const auth = firebase.auth();

// Handle logout
document.addEventListener("DOMContentLoaded", () => {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut().then(() => {
        alert("Logged out successfully!");
        window.location.href = "login.html";
      }).catch(err => console.error("Logout Error:", err));
    });
  }
});

// Auth guard — redirect if not logged in
auth.onAuthStateChanged(user => {
  if (!user && window.location.pathname.includes("index.html")) {
    window.location.href = "login.html";
  }
});
