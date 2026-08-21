// Source: API_Params_SLTOMNI_V2_0_1.xlsx, sheets "75" (A75 GetBBPackages) and "76" (A76 GetBBPackageDetails)
// Legacy endpoints:
//   GET /api/BBExternal/GetBBPackages?type=ADSL&package=WEB FAMILY PLUS
//   GET /api/BBExternal/GetBBPackageDetails?code=ADSL-WFP
// One collection backs both APIs: GetBBPackages only needs code/name/type/tier,
// GetBBPackageDetails needs the full pricing/data fields too.
const mongoose = require('mongoose');

const broadbandPackageSchema = new mongoose.Schema(
  {
    packageCode: { type: String, required: true, unique: true }, // e.g. "ADSL-WFP"
    packageName: { type: String, required: true }, // e.g. "Web Family Plus"
    type: { type: String, required: true, default: 'ADSL' }, // ADSL, SLT 4G, SLT Fiber
    // tier ranks packages within a type so we can work out Upgrades/Downgrades
    // relative to whichever package the caller passes in - higher tier = bigger package.
    tier: { type: Number, required: true },
    monthlyRental: { type: Number }, // null until real figures are filled in for that code
    standardGB: { type: Number },
    freeGB: { type: Number },
  },
  { timestamps: true, collection: 'broadband_packages' }
);

module.exports = mongoose.model('BroadbandPackage', broadbandPackageSchema);
