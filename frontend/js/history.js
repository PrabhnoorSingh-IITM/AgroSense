const BACKEND = localStorage.getItem('agro_backend') || 'http://127.0.0.1:5000';
const token = localStorage.getItem('agro_token');

async function loadHistory() {
  const res = await fetch(BACKEND + '/api/history?limit=50', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
  const j = await res.json();
  const arr = j.data || [];
  const labels = arr.map(r => new Date(r.timestamp*1000).toLocaleString());
  const points = arr.map(r => r.soil_moisture);
  const ctx = document.getElementById('historyChart').getContext('2d');
  new Chart(ctx, { type:'line', data:{labels, datasets:[{label:'Soil Moisture', data:points, borderColor:'#22c55e', fill:true}]}, options:{scales:{y:{min:0,max:100}}} });
}
loadHistory();
