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
  loadDecks();
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

const decksList = document.getElementById('decks-list');
const deckNameInput = document.getElementById('deck-name-input');

document.getElementById('create-deck-btn').addEventListener('click', createDeck);

async function loadDecks() {
  const token = localStorage.getItem('token');

  try {
    const response = await fetch(`${API_URL}/decks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const decks = await response.json();

    decksList.innerHTML = '';

    decks.forEach(deck => {
      const li = document.createElement('li');
      li.textContent = deck.name;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteDeck(deck.id));

      li.appendChild(deleteBtn);
      decksList.appendChild(li);
    });
  } catch (err) {
    console.error('Failed to load decks', err);
  }
}

async function createDeck() {
  const name = deckNameInput.value.trim();
  if (!name) return;

  const token = localStorage.getItem('token');

  try {
    await fetch(`${API_URL}/decks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    deckNameInput.value = '';
    loadDecks();
  } catch (err) {
    console.error('Failed to create deck', err);
  }
}

async function deleteDeck(id) {
  const token = localStorage.getItem('token');

  try {
    await fetch(`${API_URL}/decks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    loadDecks();
  } catch (err) {
    console.error('Failed to delete deck', err);
  }
}