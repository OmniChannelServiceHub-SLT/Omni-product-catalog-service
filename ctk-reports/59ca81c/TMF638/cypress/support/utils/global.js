export async function createVariableGlobal(bodyPost) {
	var body = Object.keys(bodyPost);
	body.forEach((element) => {
		Cypress.env(element, bodyPost[element]);
	});
}
