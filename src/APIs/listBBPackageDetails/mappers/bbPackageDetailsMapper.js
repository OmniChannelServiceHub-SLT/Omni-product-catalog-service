const { mapOfferingToResource } = require('../../../mappers/productOfferingMapper');

function mapBBPackageDetails(offering) {
  return mapOfferingToResource(offering);
}

module.exports = { mapBBPackageDetails };
