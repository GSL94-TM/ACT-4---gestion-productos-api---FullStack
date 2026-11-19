const tabLogin = document.getElementById('tab-login');
const tabRegister = document.getElementById('tab-register');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const alertBox = document.getElementById('alert-box');

const authSection = document.getElementById('auth-section');
const sessionSection = document.getElementById('session-section');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const jwtDisplay = document.getElementById('jwt-display');
const copyTokenBtn = document.getElementById('copy-token-btn');
const logoutBtn = document.getElementById('logout-btn');

const showAlert = (message, type = 'error') => {
  alertBox.textContent = message;
  alertBox.className = `alert alert-${type}`;
};

const clearAlert = () => {
  alertBox.className = 'alert hidden';
  alertBox.textContent = '';
};

const showSession = (usuario, token) => {
  userNameEl.textContent = usuario.nombre;
  userEmailEl.textContent = usuario.email;
  jwtDisplay.value = token;
  authSection.classList.add('hidden');
  sessionSection.classList.remove('hidden');
};

const showAuth = () => {
  sessionSection.classList.add('hidden');
  authSection.classList.remove('hidden');
};

//Cambio entre pestañas
tabLogin.addEventListener('click', () => {
  clearAlert();
  tabLogin.classList.add('active');
  tabRegister.classList.remove('active');
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
});

tabRegister.addEventListener('click', () => {
  clearAlert();
  tabRegister.classList.add('active');
  tabLogin.classList.remove('active');
  registerForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

//Registro de usuario
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const nombre = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const password = document.getElementById('register-password').value;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      return showAlert(data.error || 'No se pudo completar el registro.');
    }

    registerForm.reset();
    tabLogin.click();
    showAlert('Cuenta creada correctamente. Ahora inicia sesión.', 'success');
  } catch (error) {
    showAlert('Error de conexión con el servidor.');
  }
});

//Inicio de sesión
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearAlert();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      return showAlert(data.error || 'Credenciales incorrectas.');
    }

    localStorage.setItem('jwt_token', data.token);
    loginForm.reset();
    showSession(data.usuario, data.token);
  } catch (error) {
    showAlert('Error de conexión con el servidor.');
  }
});

//Copiar token JWT
copyTokenBtn.addEventListener('click', async () => {
  await navigator.clipboard.writeText(jwtDisplay.value);
  copyTokenBtn.textContent = 'Token copiado';
  setTimeout(() => {
    copyTokenBtn.textContent = 'Copiar Token';
  }, 1500);
});

//Cierre de sesión
logoutBtn.addEventListener('click', async () => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
  }
  localStorage.removeItem('jwt_token');
  showAuth();
  showAlert('Sesión cerrada correctamente.', 'success');
});

//Verificar si ya existe una sesión válida al recargar la página
window.addEventListener('DOMContentLoaded', async () => {
  const token = localStorage.getItem('jwt_token');
  if (!token) return;

  try {
    const res = await fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      localStorage.removeItem('jwt_token');
      return;
    }
    const data = await res.json();
    showSession(data.usuario, token);
  } catch (error) {
    localStorage.removeItem('jwt_token');
  }
});