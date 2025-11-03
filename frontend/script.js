// ---------------------
// Firebase initialization
// ---------------------
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Prevent double initialization
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const database = firebase.database();

// ---------------------
// DOM Elements
// ---------------------
const moistureEl = document.getElementById("soil-moisture");
const humidityEl = document.getElementById("air-humidity");
const tempEl = document.getElementById("air-temperature");

// ---------------------
// Twilio Alert Backend
// ---------------------
const BACKEND_URL = "https://your-render-backend-url.onrender.com/send-alert"; // change this

async function sendAlert(message) {
  try {
    await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    console.log("📩 Alert sent:", message);
  } catch (err) {
    console.error("Failed to send alert:", err);
  }
}

// ---------------------
// Realtime Firebase Listener
// ---------------------
database.ref("/sensor").on("value", (snapshot) => {
  const data = snapshot.val();
  if (!data) return;

  const { soilMoisture, humidity, temperature } = data;

  // Update UI
  moistureEl.textContent = `${soilMoisture}%`;
  humidityEl.textContent = `${humidity}%`;
  tempEl.textContent = `${temperature}°C`;

  // ---------------------
  // Alert logic thresholds
  // ---------------------
  if (soilMoisture < 30) {
    sendAlert(`⚠️ Low Soil Moisture: ${soilMoisture}% detected. Consider watering.`);
  }

  if (temperature > 35) {
    sendAlert(`🔥 High Temperature Alert: ${temperature}°C detected!`);
  }

  if (humidity < 20) {
    sendAlert(`💧 Low Humidity Alert: ${humidity}% detected.`);
  }
});

console.log("✅ Firebase monitoring started...");
