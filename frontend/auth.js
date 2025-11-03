// frontend/auth.js
import { auth, database } from "./firebase-init.js";

// --- LOGIN LOGIC ---
const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    auth.signInWithEmailAndPassword(email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        document.getElementById("login-error").innerText = error.message;
      });
  });
}

// --- REGISTER LOGIC ---
const registerForm = document.getElementById("register-form");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-password").value.trim();

    auth.createUserWithEmailAndPassword(email, password)
      .then((userCred) => {
        const user = userCred.user;
        database.ref(`users/${user.uid}`).set({
          farmID: "AGR-NSUT-001",
          location: "Demo Farm",
          plan: "Hackathon Pro"
        });
        alert("✅ Registered Successfully!");
        window.location.href = "login.html";
      })
      .catch((error) => {
        document.getElementById("register-error").innerText = error.message;
      });
  });
}

// --- LOGOUT ---
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  });
}
