/**
 * REFUND POLICY CONFIGURATION
 *
 * These are the deterministic business rules that the policy engine
 * evaluates BEFORE involving the AI. Clear-cut cases are resolved
 * without AI to save costs and ensure consistency.
 */

const REFUND_POLICY = {
  // Time window for eligible refunds (in days)
  maxRefundDays: 30,

  // Amount threshold requiring human review
  highValueThreshold: 500,

  // Maximum refunds a customer can request per month before flagging
  maxRefundsPerMonth: 3,

  // Categories that are always final sale
  finalSaleCategories: ['gift_cards', 'clearance', 'personalized'],

  // Rules (evaluated in order — first match wins for auto-decisions)
  rules: [
    {
      id: 'FINAL_SALE',
      description: 'Final sale items are not eligible for refunds',
      check: (order, item) => item.isFinalSale === true,
      action: 'auto_deny',
      message:
        'This item was marked as final sale and is not eligible for a refund.',
    },
    {
      id: 'EXPIRED_WINDOW',
      description: 'Orders older than 30 days cannot be refunded',
      check: (order) => {
        const daysSinceOrder = Math.floor(
          (Date.now() - new Date(order.orderDate).getTime()) /
            (1000 * 60 * 60 * 24),
        );
        return daysSinceOrder > REFUND_POLICY.maxRefundDays;
      },
      action: 'auto_deny',
      message: 'This order is outside the 30-day refund window.',
    },
    {
      id: 'HIGH_VALUE',
      description: 'Refunds above $500 require human review',
      check: (order, item, requestedAmount) =>
        requestedAmount > REFUND_POLICY.highValueThreshold,
      action: 'escalate',
      message: 'This refund exceeds $500 and requires manager approval.',
    },
    {
      id: 'DAMAGED_ITEM',
      description: 'Damaged or incorrect items qualify for approval',
      check: (order, item, requestedAmount, reason) =>
        ['damaged', 'wrong_item', 'defective'].includes(reason) &&
        Math.floor(
          (Date.now() - new Date(order.orderDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) <= REFUND_POLICY.maxRefundDays,
      action: 'auto_approve',
      message:
        'Damaged/incorrect items within the return window are approved for refund.',
    },
  ],

  // The full policy text sent to the AI for context
  fullPolicyText: `
WORKNOON REFUND POLICY (Internal Document)
==========================================

1. ELIGIBILITY: Customers may request refunds within 30 days of order delivery.
2. FINAL SALE: Items marked as "final sale," gift cards, clearance items, and personalized products are NOT eligible for refunds under any circumstances.
3. HIGH VALUE: Any refund request exceeding $500 must be escalated to a human manager for review.
4. DAMAGED/DEFECTIVE: Items reported as damaged, defective, or incorrect qualify for full refund if reported within 30 days.
5. CHANGE OF MIND: Returns due to change of mind are accepted within 30 days if the item is unopened and in original packaging. A 15% restocking fee may apply.
6. SUSPICIOUS ACTIVITY: Customers with more than 3 refund requests in a 30-day period should be flagged for manual review.
7. PARTIAL REFUNDS: For orders with multiple items, refunds are processed per-item, not per-order.
8. EVIDENCE: For claims of damage or defects, the AI should consider whether the customer provided sufficient detail. Vague claims should be escalated.
  `,
};

module.exports = REFUND_POLICY;
