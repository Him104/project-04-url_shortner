const express = require('express');
const router = express.Router();



router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReview)


module.exports = router;