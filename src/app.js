const express = require('express');
const cors = require('cors');

const vasDataBundlePackagesRoutes = require('./APIs/getVASDataBundlePackages/routes/vasDataBundlePackagesRoutes');
const bbPackagesRoutes = require('./APIs/getBBPackages/routes/bbPackagesRoutes');
const bbPackageDetailsRoutes = require('./APIs/getBBPackageDetails/routes/bbPackageDetailsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Health check - handy for confirming the service is up before wiring it into the gateway
app.get('/health', (req, res) => res.status(200).json({ status: 'ok', service: 'product-catalog-service' }));

// Base path matches the internal-api/<service>/v1 convention the team is using
// (see the IAM example: /internal-api/iam/v1/auth/login)
const BASE_PATH = '/internal-api/product-catalog/v1';

app.use(`${BASE_PATH}/vasDataBundlePackages`, vasDataBundlePackagesRoutes);
app.use(`${BASE_PATH}/bbPackages`, bbPackagesRoutes);
app.use(`${BASE_PATH}/bbPackageDetails`, bbPackageDetailsRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({
    isSuccess: false,
    errorMessege: `Route not found: ${req.method} ${req.originalUrl}`,
    exceptionDetail: null,
    dataBundle: null,
    errorShow: true,
    errorCode: 404,
  });
});

module.exports = app;
