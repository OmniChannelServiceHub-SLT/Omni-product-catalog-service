const Ajv = require('ajv');
const ajv = new Ajv({
	discriminator: { strict: false },
	strict: false,
	verbose: true,
	allErrors: true,
});
