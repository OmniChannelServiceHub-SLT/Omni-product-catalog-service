// TMF620 - Product Catalog Management: ProductOffering resource.
// Every "list of purchasable packages" API this service owns is really the
// same TMF resource type (ProductOffering), just a different offeringType:
//   vasAddon         -> listVASDataBundlePackages
//   broadbandPackage -> listBBPackages, listBBPackageDetails
//   dataGift         -> createDataGiftPackages
//   dataGiftMobile   -> listDataGiftPackagesMobile
//   advancedReporting-> listAdvancedReportingPackage
// One collection, one model, filtered by offeringType - instead of one
// collection per business feature.
const mongoose = require('mongoose');

const productOfferingSchema = new mongoose.Schema(
  {
    offeringType: {
      type: String,
      required: true,
      enum: ['vasAddon', 'broadbandPackage', 'dataGift', 'dataGiftMobile', 'advancedReporting'],
    },
    packageId: { type: String, required: true }, // addon id / catalog package id / BB package code
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String }, // vasAddon grouping, e.g. "Home Schooling & WFH"

    // pricing - used by vasAddon, dataGift, dataGiftMobile, advancedReporting
    prePrice: { type: String },
    postPrice: { type: String },
    taxValue: { type: String },

    // vasAddon-only extras
    payable: { type: Boolean, default: undefined },
    prePaidAllowed: { type: Boolean, default: undefined },
    postPaidAllowed: { type: Boolean, default: undefined },
    iconUrl: { type: String },
    colorCode: { type: String },

    // broadbandPackage-only fields
    packageType: { type: String }, // ADSL, SLT Fiber, SLT 4G
    tier: { type: Number }, // rank within packageType, used for upgrade/downgrade
    monthlyRental: { type: Number },
    standardGB: { type: Number },
    freeGB: { type: Number },
  },
  { timestamps: true, collection: 'tmf620_product_offerings' }
);

module.exports = mongoose.model('TMF620_ProductOffering', productOfferingSchema);
