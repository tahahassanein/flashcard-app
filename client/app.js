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
  decksList.innerHTML = '<li>Loading...</li>';

  try {
    const response = await fetch(`${API_URL}/decks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const decks = await response.json();

    decksList.innerHTML = '';

    if (decks.length === 0) {
      decksList.innerHTML = '<li>No decks yet — create one below</li>';
      return;
    }

    decks.forEach(deck => {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.textContent = deck.name;
      nameSpan.style.cursor = 'pointer';
      nameSpan.addEventListener('click', () => openDeck(deck.id, deck.name));

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteDeck(deck.id);
      });

      li.appendChild(nameSpan);
      li.appendChild(deleteBtn);
      decksList.appendChild(li);
    });
  } catch (err) {
    decksList.innerHTML = '<li>Failed to load decks. Try refreshing.</li>';
    console.error(err);
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

const deckScreen = document.getElementById('deck-screen');
const deckScreenTitle = document.getElementById('deck-screen-title');
const cardsList = document.getElementById('cards-list');
const cardQuestionInput = document.getElementById('card-question-input');
const cardAnswerInput = document.getElementById('card-answer-input');

let currentDeckId = null;

document.getElementById('create-card-btn').addEventListener('click', createCard);
document.getElementById('back-to-decks-btn').addEventListener('click', () => {
  deckScreen.style.display = 'none';
  appScreen.style.display = 'block';
});

function openDeck(deckId, deckName) {
  currentDeckId = deckId;
  deckScreenTitle.textContent = deckName;
  appScreen.style.display = 'none';
  deckScreen.style.display = 'block';
  loadCards();
}

async function loadCards() {
  const token = localStorage.getItem('token');
  cardsList.innerHTML = '<li>Loading...</li>';

  try {
    const response = await fetch(`${API_URL}/decks/${currentDeckId}/cards`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const cards = await response.json();

    cardsList.innerHTML = '';

    if (cards.length === 0) {
      cardsList.innerHTML = '<li>No cards yet — add one below</li>';
      return;
    }

    cards.forEach(card => {
      const li = document.createElement('li');

      const textSpan = document.createElement('span');
      textSpan.textContent = `${card.question} → ${card.answer}`;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => deleteCard(card.id));

      li.appendChild(textSpan);
      li.appendChild(deleteBtn);
      cardsList.appendChild(li);
    });
  } catch (err) {
    cardsList.innerHTML = '<li>Failed to load cards. Try refreshing.</li>';
    console.error(err);
  }
}

async function createCard() {
  const question = cardQuestionInput.value.trim();
  const answer = cardAnswerInput.value.trim();
  if (!question || !answer) return;

  const token = localStorage.getItem('token');

  try {
    await fetch(`${API_URL}/decks/${currentDeckId}/cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ question, answer })
    });

    cardQuestionInput.value = '';
    cardAnswerInput.value = '';
    loadCards();
  } catch (err) {
    console.error('Failed to create card', err);
  }
}

async function deleteCard(cardId) {
  const token = localStorage.getItem('token');

  try {
    await fetch(`${API_URL}/decks/${currentDeckId}/cards/${cardId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    loadCards();
  } catch (err) {
    console.error('Failed to delete card', err);
  }
}

const reviewScreen = document.getElementById('review-screen');
const reviewProgress = document.getElementById('review-progress');
const reviewQuestion = document.getElementById('review-question');
const reviewAnswer = document.getElementById('review-answer');
const revealBtn = document.getElementById('reveal-answer-btn');
const ratingButtons = document.getElementById('rating-buttons');
const reviewCardArea = document.getElementById('review-card-area');
const reviewDone = document.getElementById('review-done');

let reviewQueue = [];
let currentCardIndex = 0;

document.getElementById('start-review-btn').addEventListener('click', startReview);
document.getElementById('back-from-review-btn').addEventListener('click', () => {
  reviewScreen.style.display = 'none';
  appScreen.style.display = 'block';
});
revealBtn.addEventListener('click', revealAnswer);

ratingButtons.addEventListener('click', (e) => {
  if (e.target.dataset.quality === undefined) return;
  const quality = parseInt(e.target.dataset.quality);
  submitReview(quality);
});

async function startReview() {
  const token = localStorage.getItem('token');

  appScreen.style.display = 'none';
  reviewScreen.style.display = 'block';
  reviewQuestion.textContent = 'Loading...';
  reviewCardArea.style.display = 'block';
  reviewDone.style.display = 'none';
  revealBtn.style.display = 'none';
  ratingButtons.style.display = 'none';
  reviewAnswer.style.display = 'none';
  reviewProgress.textContent = '';

  try {
    const response = await fetch(`${API_URL}/review/queue`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    reviewQueue = await response.json();
    currentCardIndex = 0;
    showCurrentCard();
  } catch (err) {
    reviewQuestion.textContent = 'Failed to load. Please try again.';
    console.error(err);
  }
}

function showCurrentCard() {
  if (currentCardIndex >= reviewQueue.length) {
    reviewCardArea.style.display = 'none';
    reviewDone.style.display = 'block';
    return;
  }

  reviewCardArea.style.display = 'block';
  reviewDone.style.display = 'none';

  const card = reviewQueue[currentCardIndex];
  reviewProgress.textContent = `Card ${currentCardIndex + 1} of ${reviewQueue.length}`;

  const progressPercent = (currentCardIndex / reviewQueue.length) * 100;
  document.getElementById('progress-bar-fill').style.width = `${progressPercent}%`;

  reviewQuestion.textContent = card.question;
  reviewAnswer.textContent = card.answer;

  reviewAnswer.style.display = 'none';
  revealBtn.style.display = 'block';
  ratingButtons.style.display = 'none';
}

function revealAnswer() {
  reviewAnswer.style.display = 'block';
  revealBtn.style.display = 'none';
  ratingButtons.style.display = 'flex';
}

async function submitReview(quality) {
  const token = localStorage.getItem('token');
  const card = reviewQueue[currentCardIndex];

  try {
    await fetch(`${API_URL}/review/${card.id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ quality })
    });

    currentCardIndex++;
    showCurrentCard();
  } catch (err) {
    console.error('Failed to submit review', err);
  }
}