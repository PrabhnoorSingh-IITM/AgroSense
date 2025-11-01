const BACKEND = localStorage.getItem('agro_backend') || 'http://127.0.0.1:5000';
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
document.getElementById('showRegister').addEventListener('click', () => {
  document.getElementById('registerArea').classList.toggle('hidden');
});

loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  const pass = document.getElementById('password').value;
  if(!email || !pass) return alert('Fill both fields');
  const res = await fetch(BACKEND + '/api/login', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email, password: pass})
  });
  const j = await res.json();
  if (res.ok) {
    localStorage.setItem('agro_token', j.access_token);
    localStorage.setItem('agro_user', j.user.email);
    window.location.href = 'dashboard.html';
  } else {
    document.getElementById('message').innerText = j.msg || (j.error || 'Login failed');
  }
});

if (registerBtn) registerBtn.addEventListener('click', async () => {
  const name = document.getElementById('reg_name').value.trim();
  const email = document.getElementById('reg_email').value.trim();
  const pass = document.getElementById('reg_password').value;
  if (!name || !email || !pass) return alert('fill fields');
  const res = await fetch(BACKEND + '/api/register', {
    method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({name,email,password:pass})
  });
  const j = await res.json();
  if (res.ok) {
    alert('Registered — now login');
    document.getElementById('registerArea').classList.add('hidden');
  } else {
    document.getElementById('message').innerText = j.msg || j.error || 'Register failed';
  }
});
