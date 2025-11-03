// frontend/script.js
import { database } from "./firebase-init.js";

document.addEventListener("DOMContentLoaded", () => {
  const moistureEl = document.getElementById("moisture-val");
  const humidityEl = document.getElementById("humidity-val");
  const tempEl = document.getElementById("temp-val");

  const sensorRef = database.ref("sensors/agrosense");

  sensorRef.on("value", (snapshot) => {
    const data = snapshot.val();
    if (!data) return;

    moistureEl.textContent = `${data.soil_moisture?.toFixed(1) ?? "--"}%`;
    humidityEl.textContent = `${data.air_humidity?.toFixed(1) ?? "--"}%`;
    tempEl.textContent = `${data.air_temp?.toFixed(1) ?? "--"}°C`;
  });
});
