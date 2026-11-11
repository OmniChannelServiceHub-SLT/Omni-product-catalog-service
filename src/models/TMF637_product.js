// TMF637 - Product Inventory Management: Product resource.
// Both per-subscriber usage-snapshot APIs are the same TMF resource type
// (Product), just a different kind:
//   myPackage    -> createMyPackage         (main data package usage)
//   vasDashboard -> listDashboardVASBundles (VAS/bonus bundle usage)
const mongoose = require('mongoose');

const usageDetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    limit: { type: String, default: null },
    remaining: { type: String, default: null },
    used: { type: String, default: null },
    percentage: { type: Number, default: 0 },
    volumeUnit: { type: String, default: 'GB' },
    expiryDate: { type: String, default: null },
    claim: { type: String, default: null },
    unsubscribable: { type: Boolean, default: false },
    timestamp: { type: Number, default: 0 },
    subscriptionId: { type: String, default: null },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, enum: ['myPackage', 'vasDashboard', 'peoPurchasedProduct'] },
    subscriberId: { type: String, required: true },
    id: { type: String },
    packageName: { type: String, default: null },
    productOfferingId: { type: String },
    productOfferingName: { type: String },
    status: { type: String },
    summaryLimit: { type: String },
    summaryUsed: { type: String },
    summaryVolumeUnit: { type: String, default: 'GB' },
    usageDetails: { type: [usageDetailSchema], default: [] },
    reportedTime: { type: String },
  },
  { timestamps: true, collection: 'tmf637_products' }
);

productSchema.index(
  { kind: 1, subscriberId: 1 },
  {
    name: 'unique_my_package_subscriber',
    unique: true,
    partialFilterExpression: { kind: 'myPackage' },
  },
);
productSchema.index(
  { kind: 1, subscriberId: 1 },
  {
    name: 'unique_vas_dashboard_subscriber',
    unique: true,
    partialFilterExpression: { kind: 'vasDashboard' },
  },
);

module.exports = mongoose.model('TMF637_Product', productSchema);
