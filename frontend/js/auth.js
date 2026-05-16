const API = 'http://localhost:5000/api/auth';

// ─── Vérification au chargement de la page ───
window.addEventListener('load', () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const page = window.location.pathname;

  // Si on est sur le dashboard sans token → redirection login
  if (page.includes('dashboard') && !token) {
    window.location.href = 'index.html';
  }

  // Si on est sur login/register avec token → redirection dashboard
  if ((page.includes('index') || page.includes('register')) && token) {
    window.location.href = 'dashboard.html';
  }

  // Afficher le nom de l'utilisateur sur le dashboard
  if (page.includes('dashboard') && user) {
    document.getElementById('userName').textContent = user.fullName;
  }
});

// ─── Inscription ───
async function register() {
  const fullName = document.getElementById('fullName').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('msg');

  try {
    const res = await axios.post(`${API}/register`, { fullName, email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    msg.className = 'message success';
    msg.textContent = 'Compte créé ! Redirection...';
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = err.response?.data?.message || 'Erreur lors de l\'inscription.';
  }
}

// ─── Connexion ───
async function login() {
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value.trim();
  const msg = document.getElementById('msg');

  try {
    const res = await axios.post(`${API}/login`, { email, password });
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('user', JSON.stringify(res.data.user));
    msg.className = 'message success';
    msg.textContent = 'Connexion réussie ! Redirection...';
    setTimeout(() => window.location.href = 'dashboard.html', 1000);
  } catch (err) {
    msg.className = 'message error';
    msg.textContent = err.response?.data?.message || 'Erreur lors de la connexion.';
  }
}

// ─── Déconnexion ───
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ─── Intercepteur Axios : ajoute le token automatiquement ───
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});