// Row 117 in Omni-Channel-API-Mapping-By-Service.xlsx ("Product Catalog and Inventory S" sheet)
// Legacy source: [BBVAS] "listVASDataBundlePackages" (GET), log seq A62
const VASAddon = require('../../../models/VASAddon');

async function listVASDataBundlePackages() {
  const addons = await VASAddon.find({}).sort({ category: 1, addonId: 1 });

  // Matches real dataBundle shape from API_Params_SLTOMNI_V2_0_1.xlsx sheet "A61":
  // dataBundle.categories[].addons[]
  const grouped = new Map();
  for (const addon of addons) {
    if (!grouped.has(addon.category)) grouped.set(addon.category, []);
    grouped.get(addon.category).push({
      id: addon.addonId,
      name: addon.name,
      description: addon.description,
      postprice: addon.postprice,
      preprice: addon.preprice,
      taxValue: addon.taxValue,
      icon_url: addon.iconUrl,
      color_code: addon.colorCode,
      payable: addon.payable,
      pre_paid_allowed: addon.prePaidAllowed,
      post_paid_allowed: addon.postPaidAllowed,
    });
  }

  return {
    categories: Array.from(grouped.entries()).map(([category, items]) => ({
      category,
      addons: items,
    })),
  };
}

module.exports = { listVASDataBundlePackages };
