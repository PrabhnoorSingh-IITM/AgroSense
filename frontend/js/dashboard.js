const BACKEND = localStorage.getItem('agro_backend') || 'http://127.0.0.1:5000';
const token = localStorage.getItem('agro_token');
if (!token) {
  // allow demo by going to login
  // window.location.href = 'login.html';
}

document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('agro_token'); localStorage.removeItem('agro_user');
  window.location.href = 'login.html';
});

// Chart init
let chart = null;
function initChart() {
  const ctx = document.getElementById('moistureChart').getContext('2d');
  chart = new Chart(ctx, {
    type:'line',
    data:{labels:[], datasets:[{label:'Soil Moisture', data:[], borderColor:'#22c55e', tension:0.3, fill:true}]},
    options:{responsive:true, maintainAspectRatio:false, scales:{y:{min:0,max:100}}}
  });
}
initChart();

async function fetchLatest() {
  try {
    const res = await fetch(BACKEND + '/api/latest', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    if (!res.ok) throw new Error('not ok');
    const j = await res.json();
    const s = j.data || {};
    document.getElementById('soilVal').innerText = (s.soil_moisture ?? '--') + ' %';
    document.getElementById('humVal').innerText = (s.air_humidity ?? '--') + ' %';
    document.getElementById('tempVal').innerText = (s.air_temp ?? '--') + ' °C';

    const now = new Date().toLocaleTimeString();
    chart.data.labels.push(now);
    chart.data.datasets[0].data.push(s.soil_moisture ?? 0);
    if (chart.data.labels.length > 10) { chart.data.labels.shift(); chart.data.datasets[0].data.shift(); }
    chart.update();
  } catch(err) {
    console.warn('fetchLatest error', err);
  }
}

setInterval(fetchLatest, 5000);
fetchLatest();
