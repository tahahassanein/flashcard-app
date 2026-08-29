const API_URL = 'https://flashcard-app-api-u0ti.onrender.com';

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const authError = document.getElementById('auth-error');

document.getElementById('login-btn').addEventListener('click', () => handleAuth('login'));
document.getElementById('register-btn').addEventListener('click', () => handleAuth('register'));
document.getElementById('logout-btn').addEventListener('click', logout);

async function handleAuth(type) {
  const email = emailInput.value;
  const password = passwordInput.value;
  authError.textContent = '';

  try {
    const response = await fetch(`${API_URL}/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      authError.textContent = data.error || 'Something went wrong';
      return;
    }

    localStorage.setItem('token', data.token);
    showAppScreen();
  } catch (err) {
    authError.textContent = 'Could not reach server';
    console.error(err);
  }
}

function logout() {
  localStorage.removeItem('token');
  showAuthScreen();
}

function showAppScreen() {
  authScreen.style.display = 'none';
  appScreen.style.display = 'block';
}

function showAuthScreen() {
  authScreen.style.display = 'block';
  appScreen.style.display = 'none';
}

if (localStorage.getItem('token')) {
  showAppScreen();
} else {
  showAuthScreen();
}