const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getStats,
  updateRequestDecision,
  getSampleOrders,
} = require('../controllers/adminController');

router.get('/requests', getAllRequests);
router.get('/stats', getStats);
router.patch('/requests/:id', updateRequestDecision);
router.get('/sample-orders', getSampleOrders);

module.exports = router;
