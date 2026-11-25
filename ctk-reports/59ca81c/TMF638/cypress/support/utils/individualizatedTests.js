///<reference types="cypress" />

export function validateMandatoryAttr(bodyResponse, mandatoryKeys) {
	mandatoryKeys.forEach((attribute) => {
		if (typeof bodyResponse[attribute] === 'object') {
			expect(bodyResponse[attribute]).to.deep.equal(Cypress.env(attribute));
			// expect(bodyResponse[attribute]).not.equal(undefined);
			cy.log(attribute)
		} else {
			expect(bodyResponse[attribute]).to.equal(Cypress.env(attribute));
			// expect(bodyResponse[attribute]).not.equal(undefined);
			cy.log(attribute)
		}
	});
}
