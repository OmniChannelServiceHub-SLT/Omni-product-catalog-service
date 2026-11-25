export function getPayload(payload) {
	const parts = payload.split('#');
	const pathFile = require('../../fixtures/' + parts[0]); // Caminho para o arquivo config.json
	const payloadPath = parts[1].slice(1).split('/'); // Caminho para a propriedade payload
	let obj = pathFile;
	for (let key of payloadPath) {
		obj = obj[key];
	}
	return obj;
}

export function adjustArray(array, result) {
	array.forEach((variable) => {
		if (variable.indexOf('.') > 0) {
			getDataObject(variable, result)
		}
	});
}

function getDataObject(object, response){
	const parts = object.split('.');
	const firstPart = parts[0]
	let obj = firstPart
	Object.keys(response).forEach(key => {
		if(key === obj) {
			if(Array.isArray(response[key])){
				response[key].forEach((test)=>{
					cy.log(test)
				})
			}else{
				cy.log(response[key])
			}
		}
	})
	
}
