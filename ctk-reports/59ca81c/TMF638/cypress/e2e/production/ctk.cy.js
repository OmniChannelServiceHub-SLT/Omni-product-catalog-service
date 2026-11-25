///<reference types="cypress" />

const { createVariableGlobal } = require('../../support/utils/global');
const {
	validateMandatoryAttr,
} = require('../../support/utils/individualizatedTests');
const { getPayload } = require('../../support/utils/gets');

const yamlOas = './oas.yaml';
const ctk = require('../../fixtures/ctk.json').tests;
const config = require('../../fixtures/config.json');
var ctkArray = Object.keys(ctk).map((key) => {
	return ctk[key];
});

function getSubstring(str, start, end) {
  let char1 =  str.indexOf(start) + 1;
  let char2 =  str.lastIndexOf(end);
  return str.substring(char1, char2);
}
let firstGet = false;

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
		testContext,
		mandatoryKeys,
	} = instanceCtk;

	const bodyJson =
		(method === 'POST') | (method === 'PATCH')
			? getPayload(body)
			: undefined;

	describe(`Tests method ${method} and path ${path} ${query ? "and " + query : ""}`, () => {
		context(testContext ? testContext : "", () => {
			let response;
			before(async () => {
				query = query.replace('{id}', Cypress.env('id'));
				path = path.replace('{id}', Cypress.env('id'));
				query = query.replace(/{.*}/, Cypress.env(getSubstring(query,"{","}")))
				path = path.replace(/{.*}/, Cypress.env(getSubstring(path,"{","}")))
				response = await cy.requestTest({
					path,
					method,
					body: bodyJson,
					headers: config.headers,
					query,
				});
				if (type === 'populate') {
					
					response.body.forEach((element) => {
						Cypress.env(element, response.body[element]);
					});
				}
				if (method === 'POST' || method === 'PATCH') {
					await createVariableGlobal(response.body);
				}
			});
			it(`Tests status \n
				EndPoint: ${Cypress.config().baseUrl}`, () => {
				cy.validateStatus(response.status, statusCodes);
			});

			if (method !== 'DELETE') {
				it(`Test schema \n
					EndPoint: ${Cypress.config().baseUrl}`, () => {
					if (Array.isArray(response.body)) {
						response.body.forEach((instance) => {
							cy.validateSchema(instance, yamlOas, schemaRef);
						});
					} else {
						cy.validateSchema(
							response.body,
							yamlOas,
							schemaRef
						);
					}
				});
			}

			if (method === 'GET') {
				it(`Each attribute Test \n
					EndPoint: ${Cypress.config().baseUrl}`, () => {
					if (Array.isArray(response.body)) {
						response.body.forEach((instance) => {
							if (instance.id == Cypress.env('id')) {
								cy.log('Array if', mandatoryKeys);
								cy.log(path, query);
								validateMandatoryAttr(
									instance,
									mandatoryKeys
								);
							}
							// else {
							// 	cy.log('Array else', mandatoryKeys);
							// 	cy.log(path, query);
							// 	validateMandatoryAttr(instance, mandatoryKeys);
							// }
						});
					} else {
						cy.log('No Array');
						cy.log(path, query);
						validateMandatoryAttr(response.body, mandatoryKeys);
					}
				});
			}

		});
	});
});
