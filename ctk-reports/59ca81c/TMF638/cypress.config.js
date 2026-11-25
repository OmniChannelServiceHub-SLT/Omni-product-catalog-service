const { defineConfig } = require('cypress');
const config = require('./cypress/fixtures/config.json');
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, './cypress/reports/json/mochawesome.html');

module.exports = defineConfig({
  e2e: {
    video: false,
    screenshotOnRunFailure: false,
    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports/json',
      overwrite: false,
      json: true,
      html: true,
      reportPageTitle: 'My Test Suite',
      embeddedScreenshots: true,
      inlineAssets: true,
      state: {
        expanded: true
      },
    },
    baseUrl: config.url,
    experimentalInteractiveRunEvents: true,
    setupNodeEvents(on, config) {
      on('after:run', async () => {
        console.log('Inside after:run event');

        // Delay to ensure the file is fully written
        await new Promise(resolve => setTimeout(resolve, 5000));

        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            return console.error(`Error reading the file: ${err}`);
          }
          const modifiedData = data.replace(/\.state=\{expanded:!1\}/g, '.state={expanded:1}');
          fs.writeFile(filePath, modifiedData, 'utf8', (err) => {
            if (err) {
              return console.error(`Error writing the file: ${err}`);
            }
            console.log('File has been successfully modified and saved');
          });
        });
      });
    },
  },
});
