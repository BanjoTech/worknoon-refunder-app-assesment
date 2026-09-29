const mongoose = require('mongoose');

const refundRequestSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderNumber: { type: String, required: true },
    customerMessage: { type: String, required: true }, // What the customer actually typed
    requestedAmount: { type: Number, required: true },
    reason: {
      type: String,
      enum: [
        'damaged',
        'wrong_item',
        'not_as_described',
        'changed_mind',
        'defective',
        'other',
      ],
      required: true,
    },
    // ─── AI Decision Fields ───
    status: {
      type: String,
      enum: ['pending', 'approved', 'denied', 'escalated'],
      default: 'pending',
    },
    aiDecision: {
      type: String,
      enum: ['approve', 'deny', 'escalate', 'needs_review'],
    },
    aiReasoning: { type: String }, // The AI's explanation of WHY
    aiConfidence: { type: Number, min: 0, max: 1 }, // 0.0 to 1.0
    // ─── Policy Engine Fields ───
    policyViolations: [String], // List of rules that were broken
    policyResult: {
      type: String,
      enum: ['auto_approve', 'auto_deny', 'needs_ai_review', 'escalate'],
    },
    // ─── Audit Trail ───
    reviewedBy: { type: String, default: 'AI System' },
    reviewNotes: { type: String },
    processedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('RefundRequest', refundRequestSchema);
