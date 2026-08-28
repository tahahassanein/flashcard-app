const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const { getDecks, createDeck, deleteDeck } = require('../controllers/decksController');

router.use(requireAuth);

router.get('/', getDecks);
router.post('/', createDeck);
router.delete('/:id', deleteDeck);

module.exports = router;