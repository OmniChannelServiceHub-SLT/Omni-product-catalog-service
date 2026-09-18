const { mapUsageSnapshotToProduct } = require('../../../mappers/productMapper');

function mapDashboardVASBundles(snapshot) {
  return mapUsageSnapshotToProduct(snapshot);
}

module.exports = { mapDashboardVASBundles };
