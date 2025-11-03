const firebaseConfig = {
  apiKey: "AIzaSyDLo9IsiIVdIMZlQqz8JEVhRrUZt5BHAQw",
  authDomain: "agrosense-e00de.firebaseapp.com",
  projectId: "agrosense-e00de",
  storageBucket: "agrosense-e00de.firebasestorage.app",
  messagingSenderId: "674846785029",
  appId: "1:674846785029:web:9b6860a799cb396678a66c",
  measurementId: "G-3LQWTZK219"
};
// Use same initialized Firebase instance
const database = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
  const moistureEl = document.getElementById("moisture-value");
  const humidityEl = document.getElementById("humidity-value");
  const tempEl = document.getElementById("temperature-value");
  const farmIdEl = document.getElementById("farm-id");
  const farmLocationEl = document.getElementById("farm-location");
  const farmPlanEl = document.getElementById("farm-plan");

  // THEME TOGGLE
  const themeToggle = document.getElementById("theme-toggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      document.body.classList.toggle("dark-theme");
      const theme = document.body.classList.contains("dark-theme") ? "Dark" : "Light";
      themeToggle.textContent = theme;
    });
  }

  // Fetch Live Sensor Data
  const sensorRef = database.ref("sensors/");
  sensorRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (data) {
      moistureEl.textContent = data.soilMoisture ? `${data.soilMoisture}%` : "--%";
      humidityEl.textContent = data.humidity ? `${data.humidity}%` : "--%";
      tempEl.textContent = data.temperature ? `${data.temperature}°C` : "--°C";
    } else {
      console.warn("No sensor data found.");
    }
  }, (error) => {
    console.error("Firebase read error:", error.message);
  });

  // Fetch User Info
  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      const userRef = database.ref("users/" + user.uid);
      userRef.on("value", (snapshot) => {
        const userData = snapshot.val();
        if (userData) {
          farmIdEl.textContent = userData.farmID || "--";
          farmLocationEl.textContent = userData.location || "--";
          farmPlanEl.textContent = userData.plan || "--";
        }
      });
    }
  });
});
