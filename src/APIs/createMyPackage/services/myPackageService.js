// Row 142 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "MyPackage" (GET), log seq A48
const TMF637_Product = require('../../../models/TMF637_product');

async function createMyPackage(subscriberId) {
  return TMF637_Product.findOne({ kind: 'myPackage', subscriberId });
}

module.exports = { createMyPackage };
