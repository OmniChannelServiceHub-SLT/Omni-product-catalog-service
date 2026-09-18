// Run with: npm run seed
// Populates product_catalog_inventory_db with the sample data pulled out of
// API_Params_SLTOMNI_V2_0_1.xlsx, now stored in the 2 TMF-named models
// instead of 4 separate business-named collections. Safe to re-run - it
// clears and re-inserts each time.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const TMF620_ProductOffering = require('../models/TMF620_productOffering');
const TMF637_Product = require('../models/TMF637_product');

// ---- vasAddon (source: sheet "A61", log seq A62) ----
const vasAddons = [
  { offeringType: 'vasAddon', category: 'Home Schooling & WFH', packageId: '2', name: 'Meet Lite (Zoom,Teams,+)', description: '30 GB', prePrice: '195', postPrice: '195', taxValue: '19.89624', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/MeetLite.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { offeringType: 'vasAddon', category: 'Home Schooling & WFH', packageId: '3', name: 'Meet Max (Zoom,Teams,+)', description: '100 GB', prePrice: '490', postPrice: '490', taxValue: '49.99568', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/MeetMax.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { offeringType: 'vasAddon', category: 'LMS', packageId: '4', name: 'LMS Lite(akazaLMS & More)', description: '30 GB', prePrice: '195', postPrice: '195', taxValue: '19.89624', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/EduLite.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { offeringType: 'vasAddon', category: 'LMS', packageId: '5', name: 'LMS Max (akazaLMS & More)', description: '100 GB', prePrice: '490', postPrice: '490', taxValue: '49.99568', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/EduMax.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { offeringType: 'vasAddon', category: 'Entertainment Unlimited', packageId: '7', name: 'Entertainment Combo Pack', description: 'Unlimited', prePrice: '1990', postPrice: '1990', taxValue: '203.04369', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/VASEnt.png', colorCode: 'A1B2C3', payable: false, prePaidAllowed: true, postPaidAllowed: true },
  { offeringType: 'vasAddon', category: 'Entertainment Unlimited', packageId: '8', name: 'PeoTV Go', description: 'Unlimited', prePrice: '249', postPrice: '249', taxValue: '25.40597', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/PeoTVGo.jpg', colorCode: 'A1B2C3', payable: false, prePaidAllowed: true, postPaidAllowed: true },
];

// ---- broadbandPackage (source: sheets "75" / "76") ----
const downgrades = ['Abhimana|ADSL-AB', 'Entree|ADSL-ENT', 'Student 01|ADSL-ST1', 'Student 02|ADSL-ST2', 'Web Lite|ADSL-WLT', 'Web Starter|ADSL-WS', 'Web Pal|ADSL-WP'];
const upgrades = ['Web Family Xtra|ADSL-WFX', 'Web Pro|ADSL-WPR', 'Web Master|ADSL-WM', 'Web Champ|ADSL-WC', 'Web Life|ADSL-WL', 'Web Inspire|ADSL-WI', 'Web Premier|ADSL-WPM', 'Web Family Active|ADSL-WFA', 'Web Booster|ADSL-WB', 'Any Joy|ADSL-AJOY', 'Any Beat|ADSL-ABEA', 'Any Flix|ADSL-AFLI', 'Any Blaze|ADSL-ABLA', 'Any Tide|ADSL-ATID', 'Any Spike|ADSL-ASPI', 'Any Storm|ADSL-ASTO', 'Any Glam|ADSL-AGLA', 'Any Delight|ADSL-ADEL', 'Any Xtreme|ADSL-AXTR'];

function toOfferings(list, startTier) {
  return list.map((s, i) => {
    const [name, code] = s.split('|');
    return { offeringType: 'broadbandPackage', packageId: code, name, packageType: 'ADSL', tier: startTier + i };
  });
}

const broadbandPackages = [
  ...toOfferings(downgrades, 1),
  {
    offeringType: 'broadbandPackage',
    packageId: 'ADSL-WFP',
    name: 'Web Family Plus',
    packageType: 'ADSL',
    tier: downgrades.length + 1,
    monthlyRental: 1490,
    standardGB: 36,
    freeGB: 54,
  },
  ...toOfferings(upgrades, downgrades.length + 2),
];

// ---- advancedReporting (source: sheet "49", real sample) ----
const advancedReportingPackages = [
  { offeringType: 'advancedReporting', packageId: '1', name: 'Monthly Subscription', description: '40 LKR', prePrice: '40', postPrice: '40', taxValue: '4.08128' },
  { offeringType: 'advancedReporting', packageId: '2', name: 'Annual Subscription', description: '400 LKR', prePrice: '400', postPrice: '400', taxValue: '40.8128' },
];

// ---- dataGift / dataGiftMobile - PLACEHOLDER, no sample response in source sheet ----
const dataGiftPackages = [
  { offeringType: 'dataGift', packageId: '1', name: '1 GB Data Gift', description: '1 GB', prePrice: '50', postPrice: '50', taxValue: '5.10' },
  { offeringType: 'dataGift', packageId: '2', name: '5 GB Data Gift', description: '5 GB', prePrice: '200', postPrice: '200', taxValue: '20.41' },
];
const dataGiftPackagesMobile = [
  { offeringType: 'dataGiftMobile', packageId: '1', name: '1 GB Mobile Data Gift', description: '1 GB', prePrice: '50', postPrice: '50', taxValue: '5.10' },
  { offeringType: 'dataGiftMobile', packageId: '2', name: '5 GB Mobile Data Gift', description: '5 GB', prePrice: '200', postPrice: '200', taxValue: '20.41' },
];

// ---- myPackage (source: sheet "48", real sample, subscriberID 94382222802) ----
const myPackageSnapshots = [
  {
    kind: 'myPackage',
    subscriberId: '94382222802',
    packageName: 'WEB FAMILY PLUS',
    summaryLimit: '90.0',
    summaryUsed: '42.4',
    summaryVolumeUnit: 'GB',
    usageDetails: [
      { name: 'Standard', limit: '36.0', remaining: '11.8', used: '24.2', percentage: 33, volumeUnit: 'GB', expiryDate: '31-Oct', claim: null, unsubscribable: false, timestamp: 0, subscriptionId: null },
      { name: 'Total (Standard + Free)', limit: '90.0', remaining: '47.6', used: '42.4', percentage: 53, volumeUnit: 'GB', expiryDate: '31-Oct', claim: null, unsubscribable: false, timestamp: 0, subscriptionId: null },
    ],
    reportedTime: '26-Oct-2020 03:10 PM',
  },
];

// ---- vasDashboard (source: sheet "78", real sample, subscriberID cen2431747) ----
const vasDashboardSnapshots = [
  {
    kind: 'vasDashboard',
    subscriberId: 'cen2431747',
    packageName: null,
    summaryLimit: '30.0',
    summaryUsed: '0.0',
    summaryVolumeUnit: 'GB',
    usageDetails: [
      { name: 'Entertainment Combo Pack', limit: null, remaining: null, used: '0.0', percentage: 0, volumeUnit: 'GB', expiryDate: '30-Dec', claim: null, unsubscribable: true, timestamp: 1606717509000, subscriptionId: 'P_VB_U_Netflix' },
      { name: 'Meet Lite', limit: '30.0', remaining: '30.0', used: '0.0', percentage: 100, volumeUnit: 'GB', expiryDate: '17-Dec', claim: null, unsubscribable: false, timestamp: 1605620834000, subscriptionId: 'P_VB_Q_OM_OT_30GB' },
    ],
    reportedTime: '14-Dec-2020 04:49 PM',
  },
];

async function seed() {
  await connectDB();

  await TMF620_ProductOffering.deleteMany({});
  const offerings = [...vasAddons, ...broadbandPackages, ...advancedReportingPackages, ...dataGiftPackages, ...dataGiftPackagesMobile];
  await TMF620_ProductOffering.insertMany(offerings);
  console.log(`Seeded ${offerings.length} TMF620_ProductOffering documents.`);

  await TMF637_Product.deleteMany({});
  const products = [...myPackageSnapshots, ...vasDashboardSnapshots];
  await TMF637_Product.insertMany(products);
  console.log(`Seeded ${products.length} TMF637_Product documents.`);

  console.log('Done. Only ADSL-WFP has real monthlyRental/standardGB/freeGB values.');
  console.log('dataGiftPackages/dataGiftPackagesMobile are placeholder data - no real sample existed in the source sheet.');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
