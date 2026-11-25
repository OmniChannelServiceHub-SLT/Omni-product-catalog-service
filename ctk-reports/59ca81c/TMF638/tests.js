const util = require('util');
const exec = util.promisify(require('child_process').exec);

const ctk = require('./cypress/fixtures/ctk.json').tests;
var ctkArray = Object.keys(ctk).map((key)=>{
	return ctk[key];
})


ctkArray.forEach(async (test, i) => {
	process.env.path = test.path;
	process.env.method = test.method;

	process.env.ctk = test;

	await exec('npm run report:clean');
	await exec('npm run ctk');
});
