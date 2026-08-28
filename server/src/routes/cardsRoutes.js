const express = require('express');
const router = express.Router({ mergeParams: true });
const requireAuth = require('../middleware/authMiddleware');
const { getCards, createCard, deleteCard } = require('../controllers/cardsController');

router.use(requireAuth);

router.get('/', getCards);
router.post('/', createCard);
router.delete('/:cardId', deleteCard);

module.exports = router;