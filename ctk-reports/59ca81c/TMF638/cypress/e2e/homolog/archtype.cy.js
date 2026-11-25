///<reference types="cypress" />

const { adjustArray } = require('../../support/utils/gets');

const resultArray = require('../../mock/general.json').body[1];
const resultObject = require('../../mock/general.json').body[0];
const ctk = require('../../fixtures/ctk_mock.json').tests;
var ctkArray = Object.keys(ctk).map((key) => {
	return ctk[key];
});

ctkArray.forEach((instance) => {
	let { mandatoryKeys, response } = instance;
	describe('Validate Tests Mocks', () => {
		context('Adjust', () => {
			let result;
			it('Validate Array or Object', () => {
				if (response === 'array') {
					result = resultArray;
				} else {
					result = resultObject;
				}
				cy.log(result)
				adjustArray(mandatoryKeys, result);
			});
		});
	});
});


