const express = require('express');
const router = express.Router();
const {
  submitRefund,
  lookupOrder,
} = require('../controllers/refundController');

router.post('/', submitRefund);
router.get('/lookup/:orderNumber', lookupOrder);

module.exports = router;
