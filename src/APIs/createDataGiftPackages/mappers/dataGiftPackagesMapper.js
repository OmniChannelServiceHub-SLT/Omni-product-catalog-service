const { mapOfferingToResource } = require('../../../mappers/productOfferingMapper');

function mapDataGiftPackages(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

module.exports = { mapDataGiftPackages };
