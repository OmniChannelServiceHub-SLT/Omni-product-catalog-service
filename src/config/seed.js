// Run with: npm run seed
// Populates product_catalog_inventory_db with the sample data pulled out of
// API_Params_SLTOMNI_V2_0_1.xlsx (sheets A61, 75, 76) so the 3 APIs return real data
// instead of empty arrays. Safe to re-run - it clears and re-inserts each time.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const VASAddon = require('../models/VASAddon');
const BroadbandPackage = require('../models/BroadbandPackage');

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

async function seed() {
  await connectDB();

  await VASAddon.deleteMany({});
  await VASAddon.insertMany(vasAddons);
  console.log(`Seeded ${vasAddons.length} VAS addons.`);

  await BroadbandPackage.deleteMany({});
  await BroadbandPackage.insertMany(broadbandPackages);
  console.log(`Seeded ${broadbandPackages.length} broadband packages.`);

  console.log('Done. Only ADSL-WFP has real monthlyRental/standardGB/freeGB values -');
  console.log('fill the rest in via Mongo Compass/Atlas once you have the real figures.');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
