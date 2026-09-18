const { mapOfferingToResource } = require('../../../mappers/productOfferingMapper');

function mapBBPackages({ upgrades, downgrades }) {
  return [
    ...upgrades.map((o) => mapOfferingToResource(o, { relation: 'upgrade' })),
    ...downgrades.map((o) => mapOfferingToResource(o, { relation: 'downgrade' })),
  ];
}

module.exports = { mapBBPackages };
