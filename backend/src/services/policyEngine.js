const REFUND_POLICY = require('../data/policy');

/**
 * Calculates the difference in calendar days between two dates.
 */
const getDaysDifference = (fromDate, toDate = new Date()) => {
  const diffTime = Math.abs(toDate - new Date(fromDate));
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Deterministic Policy Engine
 *
 * Evaluates orders against business policy before AI invocation.
 * Returns { policyResult, violations, matchedRule, requiresAI }
 */
const evaluatePolicy = (order, customer, requestData) => {
  const { requestedAmount, reason, itemIndex = 0 } = requestData;
  const violations = [];

  // Identify the target item from the order
  const targetItem =
    order.items && order.items[itemIndex]
      ? order.items[itemIndex]
      : order.items[0];
  const daysSinceOrder = getDaysDifference(order.orderDate);

  // ── Rule 1: Final Sale Check ──
  if (targetItem && targetItem.isFinalSale) {
    violations.push(
      `Item '${targetItem.productName}' is marked as final sale.`,
    );
    return {
      policyResult: 'auto_deny',
      violations,
      matchedRule: 'FINAL_SALE',
      reasoning:
        'Final sale items, clearance products, and personalized items cannot be returned or refunded per company policy.',
      requiresAI: false,
    };
  }

  // ── Rule 2: 30-Day Expiration Window Check ──
  if (daysSinceOrder > REFUND_POLICY.maxRefundDays) {
    violations.push(
      `Order is ${daysSinceOrder} days old (exceeds ${REFUND_POLICY.maxRefundDays}-day limit).`,
    );
    return {
      policyResult: 'auto_deny',
      violations,
      matchedRule: 'EXPIRED_WINDOW',
      reasoning: `The refund window closed ${daysSinceOrder - REFUND_POLICY.maxRefundDays} days ago. Requests must be submitted within 30 days of delivery.`,
      requiresAI: false,
    };
  }

  // ── Rule 3: High Value Escalate Check (> $500) ──
  if (requestedAmount > REFUND_POLICY.highValueThreshold) {
    violations.push(
      `Requested amount ($${requestedAmount}) exceeds the $${REFUND_POLICY.highValueThreshold} auto-approval threshold.`,
    );
    return {
      policyResult: 'escalate',
      violations,
      matchedRule: 'HIGH_VALUE',
      reasoning: `Refund requests exceeding $${REFUND_POLICY.highValueThreshold} require direct manual authorization by a support supervisor.`,
      requiresAI: true, // AI can provide reasoning summary for the human reviewer
    };
  }

  // ── Rule 4: Suspicious Customer Activity Check ──
  if (
    customer &&
    (customer.totalRefundCount >= REFUND_POLICY.maxRefundsPerMonth ||
      customer.flaggedForReview)
  ) {
    violations.push(
      `Customer account has an elevated refund frequency (${customer.totalRefundCount} previous refunds) or an active flag.`,
    );
    return {
      policyResult: 'escalate',
      violations,
      matchedRule: 'SUSPICIOUS_ACCOUNT',
      reasoning:
        'Account flagged for high refund velocity. Escalated for fraud protection and manual support review.',
      requiresAI: true,
    };
  }

  // ── Rule 5: Standard Eligibility for AI Review / Approval ──
  return {
    policyResult: 'needs_ai_review',
    violations: [],
    matchedRule: 'STANDARD_REVIEW',
    reasoning:
      'Order falls within normal policy constraints. AI assessment required for contextual validation.',
    requiresAI: true,
  };
};

module.exports = {
  evaluatePolicy,
  getDaysDifference,
};
