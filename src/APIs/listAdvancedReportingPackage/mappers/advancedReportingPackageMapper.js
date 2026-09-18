const { mapOfferingToResource } = require('../../../mappers/productOfferingMapper');

function mapAdvancedReportingPackage(offerings) {
  return offerings.map((o) => mapOfferingToResource(o));
}

module.exports = { mapAdvancedReportingPackage };
