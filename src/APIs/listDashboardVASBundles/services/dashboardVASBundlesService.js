// Row 195 in the mapping sheet ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "GetDashboardVASBundles" (GET), log seq A78
const TMF637_Product = require('../../../models/TMF637_product');

async function listDashboardVASBundles(subscriberId) {
  return TMF637_Product.findOne({ kind: 'vasDashboard', subscriberId });
}

module.exports = { listDashboardVASBundles };
