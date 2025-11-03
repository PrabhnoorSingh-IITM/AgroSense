const firebaseConfig = {
  apiKey: "AIzaSyDLo9IsiIVdIMZlQqz8JEVhRrUZt5BHAQw",
  authDomain: "agrosense-e00de.firebaseapp.com",
  projectId: "agrosense-e00de",
  storageBucket: "agrosense-e00de.firebasestorage.app",
  messagingSenderId: "674846785029",
  appId: "1:674846785029:web:9b6860a799cb396678a66c",
  measurementId: "G-3LQWTZK219"
};
// --- Globals ---
let moistureChart;

// Wait for DOM
document.addEventListener("DOMContentLoaded", function () {
  initializeChart();
  setupRealtimeListener();
});

// --- Realtime Firebase Listener ---
function setupRealtimeListener() {
  const ref = firebase.database().ref("sensors/agrosense");
  ref.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;
    updateUI(data);
  });
}

// --- Update UI ---
function updateUI(data) {
  const moisture = data.soil_moisture?.toFixed(0) || "--";
  const humidity = data.air_humidity?.toFixed(0) || "--";
  const temp = data.air_temp?.toFixed(1) || "--";

  document.getElementById("moisture-val").textContent = `${moisture}%`;
  document.getElementById("humidity-val").textContent = `${humidity}%`;
  document.getElementById("temp-val").textContent = `${temp}°C`;

  updateChart(moisture);
}

// --- Chart.js Setup ---
function initializeChart() {
  const ctx = document.getElementById("moisture-chart").getContext("2d");
  moistureChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        {
          label: "Soil Moisture (%)",
          data: [],
          borderColor: "#22C55E",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { beginAtZero: true, max: 100 },
      },
    },
  });
}

function updateChart(value) {
  const now = new Date().toLocaleTimeString();
  const chart = moistureChart;
  if (!chart) return;
  chart.data.labels.push(now);
  chart.data.datasets[0].data.push(value);
  if (chart.data.labels.length > 10) {
    chart.data.labels.shift();
    chart.data.datasets[0].data.shift();
  }
  chart.update();
}
