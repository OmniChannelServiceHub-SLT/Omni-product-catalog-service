const TMF637_Product = require('../../../models/TMF637_product');

async function listBBFreedomStatus(tpNo) {
  return TMF637_Product.findOne({
    kind: 'bbFreedomStatus',
    tpNo: tpNo
  });
}

module.exports = { listBBFreedomStatus };