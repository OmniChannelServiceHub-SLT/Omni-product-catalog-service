///<reference types="cypress" />

Cypress.Commands.add('responsePost', (route, body, qs) => {
	return cy.request({
		method: 'POST',
		url: route,
		body,
		qs,
	});
});
Cypress.Commands.add('responseGet', ({ route, qs = '', params = '' }) => {
	return cy.request({
		method: 'GET',
		url: route + '/' + params,
		qs,
	});
});

Cypress.Commands.add(
    'requestTest',
    ({ path, query = '', params = '', method, body, headers }) => {
        if (params !== '') {
            params = '/' + params;
        }
       return cy.request({
          failOnStatusCode: false,
          method,
          url: path + params + query,
          headers,
          body,
       });
    }
);

