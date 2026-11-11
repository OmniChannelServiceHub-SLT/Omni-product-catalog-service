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
const broadbandSource = [
  ['ADSL-AB', 'Abhimana', 'Standard', 390, 6, 0],
  ['ADSL-ST1', 'Student 01', 'Standard', 390, 4, 6],
  ['ADSL-WLT', 'Web Lite', 'Standard', 450, 6, 9],
  ['ADSL-ENT', 'Entree', 'Standard', 499, 7, 0],
  ['ADSL-WS', 'Web Starter', 'Standard', 740, 11, 17],
  ['ADSL-ST2', 'Student 02', 'Standard', 790, 12, 18],
  ['ADSL-WP', 'Web Pal', 'Standard', 990, 18, 27],
  ['ADSL-WFP', 'Web Family Plus', 'Standard', 1490, 36, 54],
  ['ADSL-WFA', 'Web Family Active', 'Standard', 1990, 45, 65],
  ['ADSL-WFX', 'Web Family Xtra', 'Standard', 2690, 60, 90],
  ['ADSL-WB', 'Web Booster', 'Standard', 3490, 75, 110],
  ['ADSL-WPR', 'Web Pro', 'Standard', 4890, 95, 140],
  ['ADSL-WM', 'Web Master', 'Standard', 8890, 170, 255],
  ['ADSL-WC', 'Web Champ', 'Standard', 13690, 270, 405],
  ['ADSL-WL', 'Web Life', 'Standard', 19890, 400, 600],
  ['ADSL-WI', 'Web Inspire', 'Standard', 33000, 700, 1000],
  ['ADSL-WPM', 'Web Premier', 'Standard', 58000, 1250, 1750],
  ['ADSL-AJOY', 'Any Joy', 'Any', 890, 22, 0],
  ['ADSL-ABEA', 'Any Beat', 'Any', 1290, 36, 0],
  ['ADSL-AFLI', 'Any Flix', 'Any', 1790, 53, 0],
  ['ADSL-ABLA', 'Any Blaze', 'Any', 2490, 72, 0],
  ['ADSL-ATID', 'Any Tide', 'Any', 3390, 100, 0],
  ['ADSL-ASPI', 'Any Spike', 'Any', 4390, 130, 0],
  ['ADSL-ASTO', 'Any Storm', 'Any', 6790, 200, 0],
  ['ADSL-AGLA', 'Any Glam', 'Any', 11790, 350, 0],
  ['ADSL-ADEL', 'Any Delight', 'Any', 16790, 500, 0],
  ['ADSL-AXTR', 'Any Xtreme', 'Any', 25000, 750, 0],
  ['ADSL-UNL-2', 'ADSL Unlimited 2', 'Unlimited', 2450, 0, 0],
  ['ADSL-UNL-4', 'ADSL Unlimited 4', 'Unlimited', 4450, 0, 0],
  ['ADSL-UNL-8', 'ADSL Unlimited 8', 'Unlimited', 5750, 0, 0],
];

const broadbandPackages = broadbandSource.map(
  ([packageId, name, packageGroup, monthlyRental, standardGB, freeGB], index) => ({
    offeringType: 'broadbandPackage',
    packageId,
    name,
    packageType: 'ADSL',
    packageGroup,
    tier: index + 1,
    monthlyRental,
    standardGB,
    freeGB,
  }),
);

// ---- peoPackage (source: A105 GetPEOPackagesInterim sample) ----
const peoPackageSource = [
  ['PEO-SILVER', 'PEO Silver', 59, 899],
  ['PEO-UNNATHAM', 'PEO Unnatham', 79, 899],
  ['PEO-SILVER-PLUS', 'PEO Silver Plus', 85, 1099],
  ['PEO-FAMILY', 'PEO Family', 86, 1299],
  ['PEO-GOLD', 'PEO Gold', 98, 1499],
  ['PEO-ENTERTAINMENT', 'PEO Entertainment', 88, 1499],
  ['PEO-PLATINUM', 'PEO Platinum', 105, 1899],
  ['PEO-TITANIUM', 'PEO Titanium', 120, 2099],
];

const peoPackages = peoPackageSource.map(
  ([packageId, name, channelCount, monthlyRental], index) => ({
    offeringType: 'peoPackage',
    packageId,
    name,
    accessType: 'ADSL',
    tier: index + 1,
    channelCount,
    monthlyRental,
  }),
);

// ---- voicePackage (source: A106 GetVoicePackagesInterim sample) ----
const voicePackageSource = [
  ['VOICE-FTTH-SECOND-LINE', 'FTTH 2nd Line - My Phone', 'Rs.160 worth of On net calls', 160, 'Customer'],
  ['VOICE-HOME-FIRST-LINE', 'Home 1st Line - My Phone', 'Rs.390 worth of On net calls', 390, 'Customer'],
  ['VOICE-OFFICE-FIRST-LINE', 'Office 1st Line', 'N/A', 630, 'SLT'],
];

const voicePackages = voicePackageSource.map(
  ([packageId, name, includedCallAllowance, monthlyRental, phoneUnitOwnership], index) => ({
    offeringType: 'voicePackage',
    packageId,
    name,
    accessType: 'ADSL',
    tier: index + 1,
    includedCallAllowance,
    monthlyRental,
    phoneUnitOwnership,
  }),
);

// ---- peoVasProduct (source: A119 GetAvailableProducts sample) ----
const peoVasProductSource = [
  ['P03541', 'Bollywood by Shemaroo'],
  ['P02822', 'Cinema Talkies'],
  ['P02398', 'CinemaWorld On Demand'],
  ['P04271', 'Discovery HD'],
  ['P04287', 'HBO On Demand HD'],
  ['P04021', 'Helawood Tharakawalokana'],
  ['P04282', 'Infotainment HD Bouquet'],
  ['P04283', 'Lifestyle HD Bouquet'],
  ['P03741', 'Sangamam TV'],
  ['P04268', 'Sony Six HD'],
  ['P04270', 'Sony Ten 1 HD'],
  ['P04269', 'Sony Ten 2 HD'],
  ['P04284', 'Sports HD Bouquet'],
  ['P02790', 'Staff Tamil Premium Bouquet'],
  ['P04161', 'Subha Sathiya'],
  ['P04241', 'TMT Mix'],
  ['P04001', 'TOONZ'],
  ['P04281', 'Ten cricket HD'],
  ['P03981', 'Videsa 5'],
];

const peoVasProducts = peoVasProductSource.map(([packageId, name], index) => ({
  offeringType: 'peoVasProduct',
  packageId,
  name,
  category: 'PEO TV VAS',
  tier: index + 1,
}));

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
  const offerings = [...vasAddons, ...broadbandPackages, ...peoPackages, ...voicePackages, ...peoVasProducts, ...advancedReportingPackages, ...dataGiftPackages, ...dataGiftPackagesMobile];
  await TMF620_ProductOffering.insertMany(offerings);
  console.log(`Seeded ${offerings.length} TMF620_ProductOffering documents.`);

  await TMF637_Product.deleteMany({});
  const products = [...myPackageSnapshots, ...vasDashboardSnapshots];
  await TMF637_Product.insertMany(products);
  console.log(`Seeded ${products.length} TMF637_Product documents.`);

  console.log('Done. ADSL broadband package values come from the A104 source sample.');
  console.log('dataGiftPackages/dataGiftPackagesMobile are placeholder data - no real sample existed in the source sheet.');

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
