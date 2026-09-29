const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    accountCreatedAt: { type: Date, default: Date.now },
    loyaltyTier: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze',
    },
    totalRefundCount: { type: Number, default: 0 },
    flaggedForReview: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Customer', customerSchema);
