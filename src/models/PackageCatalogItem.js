// Backs 3 catalog-list APIs that all return the same "packages" shape
// (see API_Params_SLTOMNI_V2_0_1.xlsx sheet "49", the GetAdvancedReportingPackage
// sample response) - one collection, discriminated by `catalogType`:
//   advancedReporting -> listAdvancedReportingPackage   (A49)
//   dataGift          -> createDataGiftPackages         (A57)
//   dataGiftMobile    -> listDataGiftPackagesMobile      (A65)
const mongoose = require('mongoose');

const packageCatalogItemSchema = new mongoose.Schema(
  {
    catalogType: {
      type: String,
      required: true,
      enum: ['advancedReporting', 'dataGift', 'dataGiftMobile'],
    },
    packageId: { type: String, required: true },
    packageName: { type: String, required: true },
    packageInfo: { type: String },
    prePrice: { type: String },
    postPrice: { type: String },
    taxValue: { type: String },
  },
  { timestamps: true, collection: 'package_catalog_items' }
);

module.exports = mongoose.model('PackageCatalogItem', packageCatalogItemSchema);
