// Run with: npm run seed
// Populates product_catalog_inventory_db with the sample data pulled out of
// API_Params_SLTOMNI_V2_0_1.xlsx (sheets A61, 75, 76) so the 3 APIs return real data
// instead of empty arrays. Safe to re-run - it clears and re-inserts each time.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const VASAddon = require('../models/VASAddon');
const BroadbandPackage = require('../models/BroadbandPackage');
const PackageCatalogItem = require('../models/PackageCatalogItem');
const SubscriberUsageSnapshot = require('../models/SubscriberUsageSnapshot');

const vasAddons = [
  // category: Home Schooling & WFH
  { category: 'Home Schooling & WFH', addonId: 2, name: 'Meet Lite (Zoom,Teams,+)', description: '30 GB', postprice: '195', preprice: '195', taxValue: '19.89624', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/MeetLite.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { category: 'Home Schooling & WFH', addonId: 3, name: 'Meet Max (Zoom,Teams,+)', description: '100 GB', postprice: '490', preprice: '490', taxValue: '49.99568', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/MeetMax.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  // category: LMS
  { category: 'LMS', addonId: 4, name: 'LMS Lite(akazaLMS & More)', description: '30 GB', postprice: '195', preprice: '195', taxValue: '19.89624', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/EduLite.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  { category: 'LMS', addonId: 5, name: 'LMS Max (akazaLMS & More)', description: '100 GB', postprice: '490', preprice: '490', taxValue: '49.99568', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/EduMax.jpeg', colorCode: 'A1B2C3', payable: true, prePaidAllowed: true, postPaidAllowed: true },
  // category: Entertainment Unlimited
  { category: 'Entertainment Unlimited', addonId: 7, name: 'Entertainment Combo Pack', description: 'Unlimited', postprice: '1990', preprice: '1990', taxValue: '203.04369', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/VASEnt.png', colorCode: 'A1B2C3', payable: false, prePaidAllowed: true, postPaidAllowed: true },
  { category: 'Entertainment Unlimited', addonId: 8, name: 'PeoTV Go', description: 'Unlimited', postprice: '249', preprice: '249', taxValue: '25.40597', iconUrl: 'http://internetvasmedia.slt.lk/media/VASBundles/PeoTVGo.jpg', colorCode: 'A1B2C3', payable: false, prePaidAllowed: true, postPaidAllowed: true },
];

// Downgrades (tier < base), base package, then Upgrades (tier > base) - order taken
// straight from the "Downgrades"/"Upgrades" arrays in sheet 75, all type ADSL.
const downgrades = ['Abhimana|ADSL-AB', 'Entree|ADSL-ENT', 'Student 01|ADSL-ST1', 'Student 02|ADSL-ST2', 'Web Lite|ADSL-WLT', 'Web Starter|ADSL-WS', 'Web Pal|ADSL-WP'];
const base = 'Web Family Plus|ADSL-WFP';
const upgrades = ['Web Family Xtra|ADSL-WFX', 'Web Pro|ADSL-WPR', 'Web Master|ADSL-WM', 'Web Champ|ADSL-WC', 'Web Life|ADSL-WL', 'Web Inspire|ADSL-WI', 'Web Premier|ADSL-WPM', 'Web Family Active|ADSL-WFA', 'Web Booster|ADSL-WB', 'Any Joy|ADSL-AJOY', 'Any Beat|ADSL-ABEA', 'Any Flix|ADSL-AFLI', 'Any Blaze|ADSL-ABLA', 'Any Tide|ADSL-ATID', 'Any Spike|ADSL-ASPI', 'Any Storm|ADSL-ASTO', 'Any Glam|ADSL-AGLA', 'Any Delight|ADSL-ADEL', 'Any Xtreme|ADSL-AXTR'];

function toPackages(list, startTier) {
  return list.map(([name, code], i) => ({
    packageName: name,
    packageCode: code,
    type: 'ADSL',
    tier: startTier + i,
  }));
}

const splitPairs = (arr) => arr.map((s) => s.split('|'));

const broadbandPackages = [
  ...toPackages(splitPairs(downgrades), 1),
  // Base package - the only one we have full pricing detail for (sheet 76, listBBPackageDetails sample).
  {
    packageName: 'Web Family Plus',
    packageCode: 'ADSL-WFP',
    type: 'ADSL',
    tier: downgrades.length + 1,
    monthlyRental: 1490,
    standardGB: 36,
    freeGB: 54,
  },
  ...toPackages(splitPairs(upgrades), downgrades.length + 2),
];

// Real sample from sheet "49" (listAdvancedReportingPackage / A49).
const advancedReportingPackages = [
  { catalogType: 'advancedReporting', packageId: '1', packageName: 'Monthly Subscription', packageInfo: '40 LKR', prePrice: '40', postPrice: '40', taxValue: '4.08128' },
  { catalogType: 'advancedReporting', packageId: '2', packageName: 'Annual Subscription', packageInfo: '400 LKR', prePrice: '400', postPrice: '400', taxValue: '40.8128' },
];

// PLACEHOLDER - no sample response was captured for these two in the source
// sheet (createDataGiftPackages / A57, listDataGiftPackagesMobile / A65).
// Same shape as advancedReportingPackages above since they're the same BBVAS
// "list of packages" family - replace with the real catalog once available.
const dataGiftPackages = [
  { catalogType: 'dataGift', packageId: '1', packageName: '1 GB Data Gift', packageInfo: '1 GB', prePrice: '50', postPrice: '50', taxValue: '5.10' },
  { catalogType: 'dataGift', packageId: '2', packageName: '5 GB Data Gift', packageInfo: '5 GB', prePrice: '200', postPrice: '200', taxValue: '20.41' },
];
const dataGiftPackagesMobile = [
  { catalogType: 'dataGiftMobile', packageId: '1', packageName: '1 GB Mobile Data Gift', packageInfo: '1 GB', prePrice: '50', postPrice: '50', taxValue: '5.10' },
  { catalogType: 'dataGiftMobile', packageId: '2', packageName: '5 GB Mobile Data Gift', packageInfo: '5 GB', prePrice: '200', postPrice: '200', taxValue: '20.41' },
];

// Real sample from sheet "48" (createMyPackage / A48), subscriberID 94382222802.
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

// Real sample from sheet "78" (listDashboardVASBundles / A78), subscriberID cen2431747.
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

  await VASAddon.deleteMany({});
  await VASAddon.insertMany(vasAddons);
  console.log(`Seeded ${vasAddons.length} VAS addons.`);

  await BroadbandPackage.deleteMany({});
  await BroadbandPackage.insertMany(broadbandPackages);
  console.log(`Seeded ${broadbandPackages.length} broadband packages.`);

  await PackageCatalogItem.deleteMany({});
  await PackageCatalogItem.insertMany([...advancedReportingPackages, ...dataGiftPackages, ...dataGiftPackagesMobile]);
  console.log(`Seeded ${advancedReportingPackages.length + dataGiftPackages.length + dataGiftPackagesMobile.length} package catalog items.`);

  await SubscriberUsageSnapshot.deleteMany({});
  await SubscriberUsageSnapshot.insertMany([...myPackageSnapshots, ...vasDashboardSnapshots]);
  console.log(`Seeded ${myPackageSnapshots.length + vasDashboardSnapshots.length} subscriber usage snapshots.`);

  console.log('Done. Only ADSL-WFP has real monthlyRental/standardGB/freeGB values -');
  console.log('fill the rest in via Mongo Compass/Atlas once you have the real figures.');
  console.log('dataGiftPackages/dataGiftPackagesMobile are placeholder data - no real sample existed in the source sheet.');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
