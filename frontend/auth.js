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

// ✅ Initialize Firebase only once
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();

// ✅ Redirect Logic (Safe for each page)
auth.onAuthStateChanged((user) => {
  const currentPage = window.location.pathname.split("/").pop();

  if (user) {
    // User is logged in
    if (currentPage === "login.html" || currentPage === "register.html") {
      // Redirect logged-in users to dashboard
      window.location.href = "index.html";
    }
  } else {
    // User not logged in → restrict dashboard
    if (currentPage !== "login.html" && currentPage !== "register.html") {
      window.location.href = "login.html";
    }
  }
});

// ✅ LOGIN
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth
      .signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((err) => {
        document.getElementById("login-error").textContent = err.message;
      });
  });
}

// ✅ REGISTER
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value;
    const password = document.getElementById("reg-password").value;

    auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((err) => {
        document.getElementById("register-error").textContent = err.message;
      });
  });
}

// ✅ LOGOUT
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth
      .signOut()
      .then(() => {
        window.location.href = "login.html";
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  });
}
