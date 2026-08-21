require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3005;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[product-catalog-service] running on http://localhost:${PORT}`);
  });
}

start();
