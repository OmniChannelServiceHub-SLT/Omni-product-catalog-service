// Row 263 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBExternal] "GetBBPackages" (GET), log seq A75
const TMF620_ProductOffering = require('../../../models/TMF620_productOffering');

async function listBBPackages(packageType, packageName) {
  // Legacy endpoint takes the package NAME (e.g. "WEB FAMILY PLUS"), match case-insensitively.
  const base = await TMF620_ProductOffering.findOne({
    offeringType: 'broadbandPackage',
    packageType,
    name: new RegExp(`^${packageName}$`, 'i'),
  });
  if (!base) return null;

  const [downgrades, upgrades] = await Promise.all([
    TMF620_ProductOffering.find({ offeringType: 'broadbandPackage', packageType, tier: { $lt: base.tier } }).sort({ tier: 1 }),
    TMF620_ProductOffering.find({ offeringType: 'broadbandPackage', packageType, tier: { $gt: base.tier } }).sort({ tier: 1 }),
  ]);

  return { upgrades, downgrades };
}

module.exports = { listBBPackages };
