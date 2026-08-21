// Source: API_Params_SLTOMNI_V2_0_1.xlsx, sheet "A61" (log seq A62, GetVASDataBundlePackages)
// Legacy endpoint: GET /api/BBVAS/GetVASDataBundlePackages?subscriberID=...&packageName=...
const mongoose = require('mongoose');

const vasAddonSchema = new mongoose.Schema(
  {
    category: { type: String, required: true }, // e.g. "Home Schooling & WFH", "LMS"
    addonId: { type: Number, required: true },
    name: { type: String, required: true },
    description: { type: String },
    postprice: { type: String },
    preprice: { type: String },
    taxValue: { type: String },
    iconUrl: { type: String },
    colorCode: { type: String },
    payable: { type: Boolean, default: true },
    prePaidAllowed: { type: Boolean, default: true },
    postPaidAllowed: { type: Boolean, default: true },
  },
  { timestamps: true, collection: 'vas_addons' }
);

module.exports = mongoose.model('VASAddon', vasAddonSchema);
