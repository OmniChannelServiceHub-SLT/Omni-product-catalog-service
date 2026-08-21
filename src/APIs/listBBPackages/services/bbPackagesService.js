// Row 263 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBExternal] "listBBPackages" (GET), log seq A75
const BroadbandPackage = require('../../../models/BroadbandPackage');

async function listBBPackages(type, packageName) {
  // Legacy endpoint takes the package NAME (e.g. "WEB FAMILY PLUS"), not the code -
  // match case-insensitively since callers don't send consistent casing.
  const basePackage = await BroadbandPackage.findOne({
    type,
    packageName: new RegExp(`^${packageName}$`, 'i'),
  });
  if (!basePackage) return null;

  const [downgrades, upgrades] = await Promise.all([
    BroadbandPackage.find({ type, tier: { $lt: basePackage.tier } }).sort({ tier: 1 }),
    BroadbandPackage.find({ type, tier: { $gt: basePackage.tier } }).sort({ tier: 1 }),
  ]);

  const toEntry = (pkg) => ({
    BB_PACKAGE_NAME: pkg.packageName,
    BB_PACKAGE_CODE: pkg.packageCode,
  });

  // Matches real dataBundle shape from API_Params_SLTOMNI_V2_0_1.xlsx sheet "75":
  // dataBundle.Upgrades[] / dataBundle.Downgrades[]
  return {
    Upgrades: upgrades.map(toEntry),
    Downgrades: downgrades.map(toEntry),
  };
}

module.exports = { listBBPackages };
