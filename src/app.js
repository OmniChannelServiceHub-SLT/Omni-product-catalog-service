const express = require('express');
const cors = require('cors');

// TMF620 - Product Catalog Management
const vasDataBundlePackagesRoutes = require('./APIs/listVASDataBundlePackages/routes/vasDataBundlePackagesRoutes');
const bbPackagesRoutes = require('./APIs/listBBPackages/routes/bbPackagesRoutes');
const bbPackageDetailsRoutes = require('./APIs/listBBPackageDetails/routes/bbPackageDetailsRoutes');
const dataGiftPackagesRoutes = require('./APIs/createDataGiftPackages/routes/dataGiftPackagesRoutes');
const dataGiftPackagesMobileRoutes = require('./APIs/listDataGiftPackagesMobile/routes/dataGiftPackagesMobileRoutes');
const dashboardVASBundlesRoutes = require('./APIs/listDashboardVASBundles/routes/dashboardVASBundlesRoutes');

// TMF637 - Product Inventory Management
const myPackageRoutes = require('./APIs/createMyPackage/routes/myPackageRoutes');
const advancedReportingPackageRoutes = require('./APIs/listAdvancedReportingPackage/routes/advancedReportingPackageRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check - handy for confirming the service is up before wiring it into the gateway
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'product-catalog-service' }));

// These MUST match the paths the API Gateway proxies to this service
// (see OmniChannel-API-Gateway/src/routes/product.routes.js) - the gateway
// forwards the client's original URL untouched, so whatever prefix it proxies,
// this service has to be listening on the exact same prefix.
const CATALOG_BASE_PATH = '/tmf-api/productCatalogManagement/v4'; // TMF620
const INVENTORY_BASE_PATH = '/tmf-api/productInventoryManagement/v4'; // TMF637

// TMF620 - Product Catalog Management
app.use(`${CATALOG_BASE_PATH}/vasDataBundlePackages`, vasDataBundlePackagesRoutes);
app.use(`${CATALOG_BASE_PATH}/bbPackages`, bbPackagesRoutes);
app.use(`${CATALOG_BASE_PATH}/bbPackageDetails`, bbPackageDetailsRoutes);
app.use(`${CATALOG_BASE_PATH}/dataGiftPackages`, dataGiftPackagesRoutes);
app.use(`${CATALOG_BASE_PATH}/dataGiftPackagesMobile`, dataGiftPackagesMobileRoutes);
app.use(`${CATALOG_BASE_PATH}/dashboardVASBundles`, dashboardVASBundlesRoutes);

// TMF637 - Product Inventory Management
app.use(`${INVENTORY_BASE_PATH}/myPackage`, myPackageRoutes);
app.use(`${INVENTORY_BASE_PATH}/advancedReportingPackages`, advancedReportingPackageRoutes);

// 404 fallback - TMF-standard error shape, matching src/middleware/tmfResponse.js
app.use((req, res) => {
  res.status(404).json({
    code: '404',
    reason: 'NotFound',
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    status: '404',
    '@type': 'Error',
  });
});

module.exports = app;
