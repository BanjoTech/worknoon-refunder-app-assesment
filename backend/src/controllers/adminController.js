const RefundRequest = require('../models/RefundRequest');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

/**
 * GET /api/admin/requests
 * Fetch all refund requests with sorting, filtering, and customer/order population
 */
const getAllRequests = async (req, res, next) => {
  try {
    const { status, limit = 50 } = req.query;
    const filter = status ? { status } : {};

    const requests = await RefundRequest.find(filter)
      .populate(
        'customerId',
        'name email loyaltyTier totalRefundCount flaggedForReview',
      )
      .populate('orderId', 'orderNumber totalAmount orderDate items status')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats
 * Provides overview metrics for the support dashboard
 */
const getStats = async (req, res, next) => {
  try {
    const totalRequests = await RefundRequest.countDocuments();
    const approved = await RefundRequest.countDocuments({ status: 'approved' });
    const denied = await RefundRequest.countDocuments({ status: 'denied' });
    const escalated = await RefundRequest.countDocuments({
      status: 'escalated',
    });

    res.json({
      success: true,
      stats: {
        total: totalRequests,
        approved,
        denied,
        escalated,
        approvalRate:
          totalRequests > 0
            ? ((approved / totalRequests) * 100).toFixed(1) + '%'
            : '0%',
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/requests/:id
 * Allows support agent to manually override/update a refund decision
 */
const updateRequestDecision = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, reviewNotes, reviewedBy } = req.body;

    const updated = await RefundRequest.findByIdAndUpdate(
      id,
      {
        status,
        reviewNotes,
        reviewedBy: reviewedBy || 'Support Agent (Manual Override)',
        processedAt: new Date(),
      },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: 'Refund request not found.' });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/customers-and-orders
 * Quick helper endpoint to provide sample orders for quick testing in frontend
 */
const getSampleOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('customerId', 'name email loyaltyTier')
      .limit(15);
    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRequests,
  getStats,
  updateRequestDecision,
  getSampleOrders,
};
