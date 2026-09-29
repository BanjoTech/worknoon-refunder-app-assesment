const { processRefund } = require('../services/refundService');
const Order = require('../models/Order');

/**
 * POST /api/refunds
 * Submit a new refund request
 */
const submitRefund = async (req, res, next) => {
  try {
    const {
      orderNumber,
      customerEmail,
      requestedAmount,
      reason,
      customerMessage,
    } = req.body;

    if (
      !orderNumber ||
      !customerEmail ||
      !requestedAmount ||
      !reason ||
      !customerMessage
    ) {
      return res.status(400).json({
        error:
          'Missing required fields: orderNumber, customerEmail, requestedAmount, reason, customerMessage.',
      });
    }

    const result = await processRefund({
      orderNumber,
      customerEmail,
      requestedAmount,
      reason,
      customerMessage,
    });

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/refunds/lookup/:orderNumber
 * Fetch order details to display in UI before filing a refund
 */
const lookupOrder = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const order = await Order.findOne({ orderNumber }).populate(
      'customerId',
      'name email loyaltyTier totalRefundCount',
    );

    if (!order) {
      return res
        .status(404)
        .json({ error: `Order #${orderNumber} not found.` });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitRefund,
  lookupOrder,
};
