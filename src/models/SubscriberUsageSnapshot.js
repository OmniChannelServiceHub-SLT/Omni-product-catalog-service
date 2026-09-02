// Backs 2 per-subscriber usage-snapshot APIs that return the identical shape
// (see API_Params_SLTOMNI_V2_0_1.xlsx sheets "48" and "78") - one collection,
// discriminated by `kind`:
//   myPackage    -> createMyPackage           (A48) - main data package usage
//   vasDashboard -> listDashboardVASBundles   (A78) - VAS/bonus bundle usage
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

const subscriberUsageSnapshotSchema = new mongoose.Schema(
  {
    kind: { type: String, required: true, enum: ['myPackage', 'vasDashboard'] },
    subscriberId: { type: String, required: true },
    packageName: { type: String, default: null },
    summaryLimit: { type: String },
    summaryUsed: { type: String },
    summaryVolumeUnit: { type: String, default: 'GB' },
    usageDetails: { type: [usageDetailSchema], default: [] },
    reportedTime: { type: String },
  },
  { timestamps: true, collection: 'subscriber_usage_snapshots' }
);

subscriberUsageSnapshotSchema.index({ kind: 1, subscriberId: 1 }, { unique: true });

module.exports = mongoose.model('SubscriberUsageSnapshot', subscriberUsageSnapshotSchema);
