'use strict';

// TMF637 v4.0.0 Product first-level attributes.
const PRODUCT_FIELDS = new Set([
  'id', 'href', 'description', 'isBundle', 'isCustomerVisible', 'name',
  'orderDate', 'productSerialNumber', 'startDate', 'terminationDate',
  'agreement', 'billingAccount', 'place', 'product', 'productCharacteristic',
  'productOffering', 'productOrderItem', 'productPrice', 'productRelationship',
  'productSpecification', 'productTerm', 'realizingResource', 'realizingService',
  'relatedParty', 'status', '@baseType', '@schemaLocation', '@type'
]);

function httpError(statusCode, code, reason, message) {
  return Object.assign(new Error(message), { statusCode, code, reason });
}

// Product is supplied from src/models/product.model.js.
// Model contract: findOne({ id: string }) returns a TMF Product or null.
// authorizeProduct(user, product) must apply the project's account-access policy.
function createRetrieveSubscriptionService({ Product, authorizeProduct, publicBaseUrl }) {
  if (!Product || typeof Product.findOne !== 'function') {
    throw new TypeError('Product must expose findOne({ id }).');
  }
  if (typeof authorizeProduct !== 'function') {
    throw new TypeError('An authorizeProduct function is required.');
  }
  const base = new URL(publicBaseUrl);
  if (!['http:', 'https:'].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
    throw new TypeError('publicBaseUrl must be a trusted HTTP(S) origin or deployment prefix.');
  }
  const resourceBase = base.href.replace(/\/$/, '') + '/tmf-api/productInventory/v4/product/';

  return async function retrieveSubscription({ id, fields, user }) {
    if (typeof id !== 'string' || !id.trim()) {
      throw httpError(400, 'INVALID_PRODUCT_ID', 'Bad Request', 'A product id is required.');
    }
    if (fields !== undefined && typeof fields !== 'string') {
      throw httpError(400, 'INVALID_FIELDS', 'Bad Request', 'fields must be a comma-separated string.');
    }
    const selected = fields === undefined ? null : fields.split(',').map(field => field.trim());
    if (selected && selected.some(field => !PRODUCT_FIELDS.has(field))) {
      throw httpError(400, 'INVALID_FIELDS', 'Bad Request', 'Select valid first-level TMF637 Product attributes.');
    }

    // TMF id is a domain identifier; do not substitute MongoDB's _id.
    let record = await Product.findOne({ id });
    // Existing snapshots have MongoDB _id but no TMF id. Support their stable
    // identifier without backfilling or changing any stored records.
    if (!record && /^[a-fA-F0-9]{24}$/.test(id)) {
      record = await Product.findOne({ _id: id, id: { $exists: false } });
    }
    if (!record) {
      throw httpError(404, 'PRODUCT_NOT_FOUND', 'Not Found', 'The requested product does not exist.');
    }
    const stored = typeof record.toObject === 'function' ? record.toObject() : record;
    if (await authorizeProduct(user, stored) !== true) {
      throw httpError(403, 'PRODUCT_ACCESS_DENIED', 'Forbidden', 'Access to this product is denied.');
    }
    const tmfId = stored.id || (stored._id && String(stored._id));
    if (typeof tmfId !== 'string' || !tmfId) throw new Error('Product has no stable identifier.');
    const product = { ...stored, id: tmfId, href: resourceBase + encodeURIComponent(tmfId) };
    if (product.name === undefined && typeof stored.packageName === 'string') product.name = stored.packageName;
    if (product['@type'] === undefined) product['@type'] = 'Product';
    // Explicit snapshot characteristics preserve this model's data without
    // adding nonstandard properties to the Product response or guessing status.
    const characteristics = Array.isArray(stored.productCharacteristic)
      ? [...stored.productCharacteristic] : [];
    for (const key of ['kind', 'subscriberId', 'summaryLimit', 'summaryUsed',
      'summaryVolumeUnit', 'usageDetails', 'reportedTime']) {
      if (stored[key] !== undefined && stored[key] !== null && !characteristics.some(item => item.name === key)) {
        characteristics.push({ name: key, valueType: typeof stored[key] === 'string' ? 'string' : 'object', value: stored[key] });
      }
    }
    if (characteristics.length) product.productCharacteristic = characteristics;

    // Model owns nested TMF schema validation. Do not return MongoDB metadata
    // or the legacy dataBundle/usageDetails/privileges aggregate here.
    const keys = selected ? new Set(['id', 'href', ...selected]) : PRODUCT_FIELDS;
    return Object.fromEntries([...keys]
      .filter(key => Object.prototype.hasOwnProperty.call(product, key) && product[key] !== undefined)
      .map(key => [key, product[key]]));
  };
}

module.exports = { createRetrieveSubscriptionService };
