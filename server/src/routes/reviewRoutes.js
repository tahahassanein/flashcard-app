const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/authMiddleware');
const { getReviewQueue, submitReview } = require('../controllers/reviewController');

router.use(requireAuth);

router.get('/queue', getReviewQueue);
router.post('/:cardId', submitReview);

module.exports = router;