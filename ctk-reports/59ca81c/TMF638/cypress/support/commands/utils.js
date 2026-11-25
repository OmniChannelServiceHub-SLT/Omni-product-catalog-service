const YAML = require('yamljs');

Cypress.Commands.add('convertYamltoJson', (yaml) => {
	cy.readFile(yaml, 'utf8').then((json) => {
		return YAML.parse(json);
	});
});

Cypress.Commands.add('saveNewURL',  (url) => {
	const removeBacktick = /\{(.*?)\}/g;

	if (removeBacktick.test(url)) {
		const getData = url
			.match(removeBacktick)
			.map((match) => match.slice(1, -1));
		return getData;
	}else{
		return "";
	}
});
