// TMF637 - Product Inventory Management: Product resource.

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
    // TMF637 Product types used by this service
    kind: {
      type: String,
      required: true,
      enum: [
        'myPackage',
        'vasDashboard',
        'bbFreedomStatus'
      ]
    },

    // Subscriber / telephone number
    subscriberId: {
      type: String,
      required: true
    },

    tpNo: {
      type: String,
      default: null
    },

    packageName: {
      type: String,
      default: null
    },

    summaryLimit: {
      type: String
    },

    summaryUsed: {
      type: String
    },

    summaryVolumeUnit: {
      type: String,
      default: 'GB'
    },

    usageDetails: {
      type: [usageDetailSchema],
      default: []
    },

    reportedTime: {
      type: String
    },

    // BB Freedom Status
    freedomRequested: {
      type: String,
      enum: ['Y', 'N'],
      default: 'N'
    },

    freedomStatusMessage: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true,
    collection: 'tmf637_products'
  }
);

productSchema.index(
  { kind: 1, subscriberId: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  'TMF637_Product',
  productSchema
);