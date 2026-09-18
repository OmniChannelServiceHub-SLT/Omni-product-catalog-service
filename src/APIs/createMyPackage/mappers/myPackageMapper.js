const { mapUsageSnapshotToProduct } = require('../../../mappers/productMapper');

function mapMyPackage(snapshot) {
  return mapUsageSnapshotToProduct(snapshot);
}

module.exports = { mapMyPackage };
