///<reference types="cypress" />

const { createVariableGlobal } = require('../../support/utils/global');
const {
	validateMandatoryAttr,
} = require('../../support/utils/individualizatedTests');
const { getPayload } = require('../../support/utils/gets');

const yamlOas = './TMF629-Customer_Management-v5.0.0.oas.yaml';
const ctk = require('../../fixtures/ctk.json').tests;
var ctkArray = Object.keys(ctk).map((key) => {
	return ctk[key];
});

ctkArray.forEach((instanceCtk) => {
	let {
		method,
		path,
		body,
		query,
		statusCodes,
		headers,
		type,
		schemaRef,
		basePath,
		mandatoryKeys,
	} = instanceCtk;

	const bodyJson =
		(method === 'POST') | (method === 'PATCH')
			? getPayload(body)
			: undefined;

	describe(`Tests method ${method} and path ${path} and query ${query}`, () => {
		let response;
		before(async () => {
			cy.saveNewURL(query).then((resp) => {
				if (resp !== '') {
					resp.forEach((key) => {
						query = query.replace(`{${key}}`, Cypress.env(key));
						cy.log(query);
					});
				}
			});

			 cy.saveNewURL(path).then((resp) => {
				if (resp !== '') {
					resp.forEach((key) => {
						path = path.replace(`{${key}}`, Cypress.env(key));
						cy.log(path);
					});
				}
			});

			// path = path.replace('{id}', Cypress.env('id'));
			response = await cy.requestTest({
				path,
				method,
				body: bodyJson,
				query,
			});
			if (method === 'POST' || method === 'PATCH') {
				await createVariableGlobal(response.body);
			}
		});
		it('Tests status', () => {
			cy.validateStatus(response.status, statusCodes);
		});

		if (method !== 'DELETE') {
			it('Test schema', () => {
				if (Array.isArray(response.body)) {
					response.body.forEach((instance) => {
						cy.validateSchema(instance, yamlOas, schemaRef);
					});
				} else {
					cy.validateSchema(response.body, yamlOas, schemaRef);
				}
			});
		}

		if (method === 'GET') {
			it('Tests Individualizates', () => {
				if (Array.isArray(response.body)) {
					response.body.forEach((instance) => {
						if (instance.id == Cypress.env('id')) {
							cy.log('Array if', mandatoryKeys);
							cy.log('Path: ' + path, 'Query: ' + query);
							validateMandatoryAttr(instance, mandatoryKeys);
						}
						// else {
						// 	cy.log('Array else', mandatoryKeys);
						// 	cy.log(path, query);
						// 	validateMandatoryAttr(instance, mandatoryKeys);
						// }
					});
				} else {
					cy.log('No Array');
					cy.log('Path: ' + path, 'Query: ' + query);
					validateMandatoryAttr(response.body, mandatoryKeys);
				}
			});
		}
	});
});
