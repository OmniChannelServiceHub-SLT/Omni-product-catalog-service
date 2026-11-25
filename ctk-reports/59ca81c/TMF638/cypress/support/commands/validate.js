///<reference types="cypress"/>

const Ajv = require('ajv');
const ajv = new Ajv({
	discriminator: { strict: false },
	strict: false,
	verbose: true,
	allErrors: true,
});

Cypress.Commands.add('validateSchema', (body, yaml, schemaRef) => {
	cy.convertYamltoJson(yaml).then((schema) => {
		for (const key in schema.components.schemas) {
			if ('discriminator' in schema.components.schemas[key]) {
				delete schema.components.schemas[key].discriminator;
			}
		}
		ajv.removeSchema('oas.json');
		ajv.addSchema(schema, 'oas.json');
		var testajv = ajv.compile(
			{ $ref: ('oas.json' + schemaRef).toString() },
			{
				allErrors: true,
				discriminator: true,
				strict: { discriminator: false },
				verbose: true,
			}
		);

		const valid = testajv(body);
		if (!valid) {
			testajv.errors.forEach((error) => {
				// cy.log(error)
				throw new Error(error.instancePath + ' ' + error.message);
			});
		} else {
			cy.log('Success ', valid);
		}
		// expect(body).to.be.jsonSchema(schema);
	});
});

Cypress.Commands.add('validateStatus', (receivedStatus, expectedStatus) => {
	expect(receivedStatus).to.be.oneOf(expectedStatus);
});
