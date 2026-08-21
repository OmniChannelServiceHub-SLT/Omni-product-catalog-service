// Row 268 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBExternal] "listBBPackageDetails" (GET), log seq A76
const BroadbandPackage = require('../../../models/BroadbandPackage');

async function listBBPackageDetails(packageCode) {
  const pkg = await BroadbandPackage.findOne({ packageCode });
  if (!pkg) return null;

  // Matches real dataBundle shape from API_Params_SLTOMNI_V2_0_1.xlsx sheet "76":
  // dataBundle is an ARRAY with one entry, not an object.
  return [
    {
      BB_PACKAGE_CODE: pkg.packageCode,
      BB_PACKAGE_NAME: pkg.packageName,
      MONTHLY_RENTAL: pkg.monthlyRental != null ? pkg.monthlyRental.toFixed(2) : null,
      STANDARD_GB: pkg.standardGB != null ? String(pkg.standardGB) : null,
      FREE_GB: pkg.freeGB != null ? String(pkg.freeGB) : null,
    },
  ];
}

module.exports = { listBBPackageDetails };
