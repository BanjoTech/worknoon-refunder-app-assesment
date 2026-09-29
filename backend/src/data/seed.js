const path = require('path');
// Automatically finds .env in the root folder or backend folder
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Order = require('../models/Order');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/worknoon_refunds';

// Helper to create dates relative to today
const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const customers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '555-0101',
    address: {
      street: '123 Oak St',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US',
    },
    accountCreatedAt: daysAgo(365),
    loyaltyTier: 'gold',
    totalRefundCount: 1,
  },
  {
    name: 'Marcus Chen',
    email: 'marcus.chen@email.com',
    phone: '555-0102',
    address: {
      street: '456 Pine Ave',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'US',
    },
    accountCreatedAt: daysAgo(180),
    loyaltyTier: 'silver',
    totalRefundCount: 0,
  },
  {
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    phone: '555-0103',
    address: {
      street: '789 Elm Blvd',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101',
      country: 'US',
    },
    accountCreatedAt: daysAgo(90),
    loyaltyTier: 'bronze',
    totalRefundCount: 4,
    flaggedForReview: true,
  },
  {
    name: 'James Wilson',
    email: 'james.wilson@email.com',
    phone: '555-0104',
    address: {
      street: '321 Maple Dr',
      city: 'Denver',
      state: 'CO',
      zipCode: '80201',
      country: 'US',
    },
    accountCreatedAt: daysAgo(730),
    loyaltyTier: 'platinum',
    totalRefundCount: 2,
  },
  {
    name: 'Aisha Patel',
    email: 'aisha.patel@email.com',
    phone: '555-0105',
    address: {
      street: '654 Cedar Ln',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'US',
    },
    accountCreatedAt: daysAgo(45),
    loyaltyTier: 'bronze',
    totalRefundCount: 0,
  },
  {
    name: 'David Kim',
    email: 'david.kim@email.com',
    phone: '555-0106',
    address: {
      street: '987 Birch Rd',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      country: 'US',
    },
    accountCreatedAt: daysAgo(200),
    loyaltyTier: 'silver',
    totalRefundCount: 1,
  },
  {
    name: 'Lisa Thompson',
    email: 'lisa.thompson@email.com',
    phone: '555-0107',
    address: {
      street: '147 Walnut St',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      country: 'US',
    },
    accountCreatedAt: daysAgo(500),
    loyaltyTier: 'gold',
    totalRefundCount: 0,
  },
  {
    name: 'Robert Garcia',
    email: 'robert.garcia@email.com',
    phone: '555-0108',
    address: {
      street: '258 Spruce Ave',
      city: 'Phoenix',
      state: 'AZ',
      zipCode: '85001',
      country: 'US',
    },
    accountCreatedAt: daysAgo(30),
    loyaltyTier: 'bronze',
    totalRefundCount: 0,
  },
  {
    name: 'Jennifer Lee',
    email: 'jennifer.lee@email.com',
    phone: '555-0109',
    address: {
      street: '369 Ash Blvd',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94101',
      country: 'US',
    },
    accountCreatedAt: daysAgo(150),
    loyaltyTier: 'silver',
    totalRefundCount: 2,
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@email.com',
    phone: '555-0110',
    address: {
      street: '741 Poplar Dr',
      city: 'Nashville',
      state: 'TN',
      zipCode: '37201',
      country: 'US',
    },
    accountCreatedAt: daysAgo(60),
    loyaltyTier: 'bronze',
    totalRefundCount: 0,
  },
  {
    name: 'Sofia Martinez',
    email: 'sofia.martinez@email.com',
    phone: '555-0111',
    address: {
      street: '852 Willow Ln',
      city: 'San Diego',
      state: 'CA',
      zipCode: '92101',
      country: 'US',
    },
    accountCreatedAt: daysAgo(400),
    loyaltyTier: 'gold',
    totalRefundCount: 1,
  },
  {
    name: 'Thomas Anderson',
    email: 'thomas.anderson@email.com',
    phone: '555-0112',
    address: {
      street: '963 Cypress Rd',
      city: 'Atlanta',
      state: 'GA',
      zipCode: '30301',
      country: 'US',
    },
    accountCreatedAt: daysAgo(15),
    loyaltyTier: 'bronze',
    totalRefundCount: 0,
  },
  {
    name: 'Rachel Green',
    email: 'rachel.green@email.com',
    phone: '555-0113',
    address: {
      street: '159 Redwood St',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'US',
    },
    accountCreatedAt: daysAgo(300),
    loyaltyTier: 'silver',
    totalRefundCount: 3,
  },
  {
    name: 'Daniel Okafor',
    email: 'daniel.okafor@email.com',
    phone: '555-0114',
    address: {
      street: '267 Sequoia Ave',
      city: 'Houston',
      state: 'TX',
      zipCode: '77001',
      country: 'US',
    },
    accountCreatedAt: daysAgo(120),
    loyaltyTier: 'bronze',
    totalRefundCount: 0,
  },
  {
    name: 'Karen White',
    email: 'karen.white@email.com',
    phone: '555-0115',
    address: {
      street: '378 Magnolia Blvd',
      city: 'Detroit',
      state: 'MI',
      zipCode: '48201',
      country: 'US',
    },
    accountCreatedAt: daysAgo(250),
    loyaltyTier: 'gold',
    totalRefundCount: 1,
  },
];

const ordersData = [
  // 1. Sarah — Recent order, damaged headphones → SHOULD APPROVE
  {
    customerIndex: 0,
    orderNumber: 'ORD-2024-1001',
    orderDate: daysAgo(5),
    items: [
      {
        productName: 'Wireless Headphones Pro',
        productId: 'WHP-001',
        category: 'electronics',
        price: 89.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 89.99,
    status: 'delivered',
  },
  // 2. Marcus — Order from 60 days ago → SHOULD DENY (expired)
  {
    customerIndex: 1,
    orderNumber: 'ORD-2024-1002',
    orderDate: daysAgo(60),
    items: [
      {
        productName: 'Running Shoes Elite',
        productId: 'RSE-002',
        category: 'footwear',
        price: 129.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 129.99,
    status: 'delivered',
  },
  // 3. Emily — Final sale clearance item → SHOULD DENY
  {
    customerIndex: 2,
    orderNumber: 'ORD-2024-1003',
    orderDate: daysAgo(10),
    items: [
      {
        productName: 'Clearance Summer Dress',
        productId: 'CSD-003',
        category: 'clearance',
        price: 24.99,
        quantity: 2,
        isFinalSale: true,
      },
    ],
    totalAmount: 49.98,
    status: 'delivered',
  },
  // 4. James — High-value refund ($750) → SHOULD ESCALATE
  {
    customerIndex: 3,
    orderNumber: 'ORD-2024-1004',
    orderDate: daysAgo(12),
    items: [
      {
        productName: '4K OLED Monitor 32"',
        productId: 'MON-004',
        category: 'electronics',
        price: 749.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 749.99,
    status: 'delivered',
  },
  // 5. Aisha — Wrong item received → SHOULD APPROVE
  {
    customerIndex: 4,
    orderNumber: 'ORD-2024-1005',
    orderDate: daysAgo(3),
    items: [
      {
        productName: 'Blue Yoga Mat',
        productId: 'BYM-005',
        category: 'fitness',
        price: 35.0,
        quantity: 1,
        isFinalSale: false,
      },
      {
        productName: 'Resistance Bands Set',
        productId: 'RBS-006',
        category: 'fitness',
        price: 19.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 54.99,
    status: 'delivered',
  },
  // 6. David — Changed mind, within window → Gray area for AI
  {
    customerIndex: 5,
    orderNumber: 'ORD-2024-1006',
    orderDate: daysAgo(15),
    items: [
      {
        productName: 'Leather Messenger Bag',
        productId: 'LMB-007',
        category: 'accessories',
        price: 159.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 159.99,
    status: 'delivered',
  },
  // 7. Lisa — Gift card purchase → SHOULD DENY (final sale)
  {
    customerIndex: 6,
    orderNumber: 'ORD-2024-1007',
    orderDate: daysAgo(7),
    items: [
      {
        productName: '$100 Gift Card',
        productId: 'GC-100',
        category: 'gift_cards',
        price: 100.0,
        quantity: 1,
        isFinalSale: true,
      },
    ],
    totalAmount: 100.0,
    status: 'delivered',
  },
  // 8. Robert — Defective electronics → SHOULD APPROVE
  {
    customerIndex: 7,
    orderNumber: 'ORD-2024-1008',
    orderDate: daysAgo(8),
    items: [
      {
        productName: 'Smart Home Hub',
        productId: 'SHH-008',
        category: 'electronics',
        price: 199.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 199.99,
    status: 'delivered',
  },
  // 9. Jennifer — Order at 30-day boundary → Edge case for AI
  {
    customerIndex: 8,
    orderNumber: 'ORD-2024-1009',
    orderDate: daysAgo(30),
    items: [
      {
        productName: 'Ceramic Cookware Set',
        productId: 'CCS-009',
        category: 'kitchen',
        price: 249.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 249.99,
    status: 'delivered',
  },
  // 10. Michael — Normal return → SHOULD APPROVE
  {
    customerIndex: 9,
    orderNumber: 'ORD-2024-1010',
    orderDate: daysAgo(14),
    items: [
      {
        productName: 'Cotton T-Shirt Pack (5)',
        productId: 'CTP-010',
        category: 'clothing',
        price: 39.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 39.99,
    status: 'delivered',
  },
  // 11. Sofia — Bulk order $1185 → SHOULD ESCALATE
  {
    customerIndex: 10,
    orderNumber: 'ORD-2024-1011',
    orderDate: daysAgo(20),
    items: [
      {
        productName: 'Office Chair Ergonomic',
        productId: 'OCE-011',
        category: 'furniture',
        price: 350.0,
        quantity: 3,
        isFinalSale: false,
      },
      {
        productName: 'Standing Desk Mat',
        productId: 'SDM-012',
        category: 'furniture',
        price: 45.0,
        quantity: 3,
        isFinalSale: false,
      },
    ],
    totalAmount: 1185.0,
    status: 'delivered',
  },
  // 12. Thomas — Brand new customer, immediate refund → Gray area for AI
  {
    customerIndex: 11,
    orderNumber: 'ORD-2024-1012',
    orderDate: daysAgo(2),
    items: [
      {
        productName: 'Gaming Keyboard RGB',
        productId: 'GKR-013',
        category: 'electronics',
        price: 129.99,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 129.99,
    status: 'delivered',
  },
  // 13. Rachel — Multiple past refunds (suspicious pattern) → SHOULD ESCALATE
  {
    customerIndex: 12,
    orderNumber: 'ORD-2024-1013',
    orderDate: daysAgo(18),
    items: [
      {
        productName: 'Designer Sunglasses',
        productId: 'DSG-014',
        category: 'accessories',
        price: 275.0,
        quantity: 1,
        isFinalSale: false,
      },
    ],
    totalAmount: 275.0,
    status: 'delivered',
  },
  // 14. Daniel — Damaged item, good history → SHOULD APPROVE
  {
    customerIndex: 13,
    orderNumber: 'ORD-2024-1014',
    orderDate: daysAgo(6),
    items: [
      {
        productName: 'Bluetooth Speaker Waterproof',
        productId: 'BSW-015',
        category: 'electronics',
        price: 79.99,
        quantity: 2,
        isFinalSale: false,
      },
    ],
    totalAmount: 159.98,
    status: 'delivered',
  },
  // 15. Karen — Personalized item → SHOULD DENY (final sale)
  {
    customerIndex: 14,
    orderNumber: 'ORD-2024-1015',
    orderDate: daysAgo(22),
    items: [
      {
        productName: 'Custom Engraved Necklace',
        productId: 'CEN-016',
        category: 'personalized',
        price: 89.99,
        quantity: 1,
        isFinalSale: true,
      },
    ],
    totalAmount: 89.99,
    status: 'delivered',
  },
];

const seedDatabase = async () => {
  try {
    console.log(
      `Connecting to MongoDB URI: ${MONGODB_URI.replace(/:([^:@]{4})[^:@]*@/, ':****@')}`,
    );
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Customer.deleteMany({});
    await Order.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert customers
    const insertedCustomers = await Customer.insertMany(customers);
    console.log(`👥 Inserted ${insertedCustomers.length} customers`);

    // Insert orders with correct customer references
    const orders = ordersData.map((order) => ({
      ...order,
      customerId: insertedCustomers[order.customerIndex]._id,
      shippingAddress: insertedCustomers[order.customerIndex].address,
    }));

    const cleanOrders = orders.map(({ customerIndex, ...rest }) => rest);
    const insertedOrders = await Order.insertMany(cleanOrders);
    console.log(`📦 Inserted ${insertedOrders.length} orders`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
