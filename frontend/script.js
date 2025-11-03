// frontend/script.js
import { database } from "./firebase-init.js";

let moistureChart = null;
const chartLabels = [];
const chartData = [];

document.addEventListener("DOMContentLoaded", () => {
  const moistureEl = document.getElementById("moisture-val");
  const humidityEl = document.getElementById("humidity-val");
  const tempEl = document.getElementById("temp-val");
  const statusText = document.getElementById("status-text");

  // Initialize Chart.js
  const ctx = document.getElementById("moisture-chart").getContext("2d");
  moistureChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: chartLabels,
      datasets: [{
        label: "Soil Moisture (%)",
        data: chartData,
        borderColor: "#22C55E",
        backgroundColor: "rgba(34,197,94,0.1)",
        borderWidth: 3,
        tension: 0.3,
        fill: true,
        pointRadius: 3
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: "Time" } },
        y: { title: { display: true, text: "Moisture (%)" }, min: 0, max: 100 }
      },
      plugins: {
        legend: { display: false }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Firebase Listener
  const sensorRef = database.ref("sensors/agrosense");
  sensorRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    const moisture = parseFloat(data.soil_moisture || 0);
    const humidity = parseFloat(data.air_humidity || 0);
    const temp = parseFloat(data.air_temp || 0);

    moistureEl.textContent = `${moisture.toFixed(1)}%`;
    humidityEl.textContent = `${humidity.toFixed(1)}%`;
    tempEl.textContent = `${temp.toFixed(1)}°C`;

    // Update Status
    if (moisture < 20) {
      statusText.textContent = "⚠️ Soil too dry! Immediate irrigation needed.";
      document.getElementById("status-banner").style.background = "#F87171";
    } else if (humidity > 80) {
      statusText.textContent = "🌫 High humidity — fungal risk detected.";
      document.getElementById("status-banner").style.background = "#FBBF24";
    } else {
      statusText.textContent = "✅ Field conditions are optimal.";
      document.getElementById("status-banner").style.background = "#22C55E";
    }

    // Update chart
    const timeLabel = new Date().toLocaleTimeString();
    chartLabels.push(timeLabel);
    chartData.push(moisture);
    if (chartLabels.length > 10) {
      chartLabels.shift();
      chartData.shift();
    }
    moistureChart.update();
  });
});
