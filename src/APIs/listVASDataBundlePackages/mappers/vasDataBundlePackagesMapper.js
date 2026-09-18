const { mapOfferingToResource } = require('../../../mappers/productOfferingMapper');

function mapVASDataBundlePackages(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

module.exports = { mapVASDataBundlePackages };
