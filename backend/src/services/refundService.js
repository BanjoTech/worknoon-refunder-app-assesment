const Order = require('../models/Order');
const Customer = require('../models/Customer');
const RefundRequest = require('../models/RefundRequest');
const { evaluatePolicy } = require('./policyEngine');
const { analyzeRefundWithAI } = require('./aiService');
const { reconcileDecisions } = require('./aiGuardrails');

/**
 * Complete workflow for processing a refund request.
 */
const processRefund = async ({
  orderNumber,
  customerEmail,
  requestedAmount,
  reason,
  customerMessage,
}) => {
  // 1. Fetch Order and Customer records
  const order = await Order.findOne({ orderNumber }).populate('customerId');
  if (!order) {
    throw {
      status: 404,
      message: `Order #${orderNumber} not found in the system.`,
    };
  }

  const customer = order.customerId;
  if (
    customerEmail &&
    customer.email.toLowerCase() !== customerEmail.toLowerCase().trim()
  ) {
    throw {
      status: 400,
      message: `Provided email does not match the customer record on Order #${orderNumber}.`,
    };
  }

  // 2. Evaluate Policy Rules
  const policyResult = evaluatePolicy(order, customer, {
    requestedAmount: Number(requestedAmount),
    reason,
    customerMessage,
  });

  let aiResult = null;
  let finalStatus = 'pending';
  let reasoning = '';
  let customerReply = '';

  // 3. Decide whether AI reasoning is needed
  if (!policyResult.requiresAI && policyResult.policyResult === 'auto_deny') {
    // Hard rejection (e.g. final sale item or >30 days expired)
    finalStatus = 'denied';
    reasoning = policyResult.reasoning;
    customerReply = `We cannot approve a refund for Order #${orderNumber}. Reason: ${policyResult.reasoning}`;
  } else {
    // Gray area or requires AI analysis/summary
    aiResult = await analyzeRefundWithAI({
      order,
      customer,
      requestData: { requestedAmount, reason, customerMessage },
      policyEvaluation: policyResult,
    });

    // Reconcile policy vs AI
    finalStatus = reconcileDecisions(
      policyResult.policyResult,
      aiResult.decision,
    );
    reasoning = aiResult.reasoning;
    customerReply = aiResult.customerResponse;
  }

  // 4. Record the refund request in the database (Audit trail)
  const refundRecord = await RefundRequest.create({
    customerId: customer._id,
    orderId: order._id,
    orderNumber: order.orderNumber,
    customerMessage,
    requestedAmount: Number(requestedAmount),
    reason,
    status: finalStatus,
    aiDecision: aiResult
      ? aiResult.decision
      : finalStatus === 'denied'
        ? 'deny'
        : 'escalate',
    aiReasoning: reasoning,
    aiConfidence: aiResult ? aiResult.confidence : 1.0,
    policyViolations: policyResult.violations,
    policyResult: policyResult.policyResult,
    reviewedBy: aiResult ? 'Groq Llama-3.3 AI' : 'Deterministic Policy Engine',
    processedAt: new Date(),
  });

  // 5. Update customer statistics if approved
  if (finalStatus === 'approved') {
    await Customer.findByIdAndUpdate(customer._id, {
      $inc: { totalRefundCount: 1 },
    });
  }

  return {
    refundId: refundRecord._id,
    orderNumber: order.orderNumber,
    customerName: customer.name,
    status: finalStatus,
    reasoning,
    customerResponse: customerReply,
    policyViolations: policyResult.violations,
    processedAt: refundRecord.processedAt,
  };
};

module.exports = {
  processRefund,
};
