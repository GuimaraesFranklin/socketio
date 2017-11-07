var config = require('./config');
var npm = require('npm-programmatic');
var servidor = require('livregestao-client');
servidor.run(config);
	
/*npm.install(['livregestao-client'], {cwd: __dirname}).then(() => {
    console.log('Iniciando servidor');
    var servidor = require('livregestao-client');
    servidor.run(config);
}).catch((e) => {
	console.log(e);
	console.log('ERRO. Iniciando servidor');
    var servidor = require('livregestao-client');
    servidor.run(config);
});*/