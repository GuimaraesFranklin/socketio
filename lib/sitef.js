const fs = require('fs');
const path = require('path');
const os = require('os');

exports.init = function (socketio, config){
    new Sitef(socketio, config);
};

class Sitef {
    
    constructor (socketio, config) {
        this.socketio = socketio;
        this.isWindows = ! /linux/.test(os.platform());
        this.config = config;
        this.debugSitef = config.sitef.debug;
        this.adicionarEventos();
    }
    
    adicionarEventos () {
        let self = this;
        
        this.socketio.on('sitef_criar_arquivo', function (data){
            self.criarArquivo(data);
        });

        this.socketio.on('sitef_confirmar_impressao', function (data){
            self.confirmarImpressao(data);
        });
        
    }
    
    criarArquivo (data) {

        var resposta = this.getRespostaPadrao();
        
        
        this.criarArquivoAguardarResposta(data, 'P2').then((conteudo) => {
            this.enviarResposta({error: 0, msg: null, conteudoArquivo: conteudo, passo: 'P2'});
            return this.passoP4();
        }).then((conteudo) => {
            this.enviarResposta({error: 0, msg: null, conteudoArquivo: conteudo, passo: 'P4'});
        }).catch((e) => {
            resposta.error = 1;
            resposta.msg = e.toString();
            this.enviarResposta(resposta);
        })            
    }

    confirmarImpressao(dados) {
        this.criarArquivoAguardarResposta(dados, 'P7');
    }

    criarArquivoAguardarResposta(data, passo) {

        return new Promise((resolve, reject) => {
            this.timeoutPinpad = false;
            var conteudo = data.conteudoArquivo;
    
            var destinoFinal = this.config.sitef.pastaDestinoReq + 'IntPos.001';
            
            if(data.arquivoDestino) {
                destinoFinal = this.config.sitef.pastaDestinoReq + data.arquivoDestino;
            }
    
            var arquivoTmp = this.config.sitef.pastaDestinoReq + 'IntPos.tmp';
            var descriptor = fs.openSync(arquivoTmp, 'w');
            fs.writeSync(descriptor, conteudo);
            fs.closeSync(descriptor);
            fs.renameSync(arquivoTmp, destinoFinal);
            var arquivoEsperado = this.config.sitef.pastaDestinoResp + 'IntPos.STS';
            var self = this;
    
            if(this.debugSitef) {
                setTimeout(function () {
                    var descriptor = fs.openSync(arquivoEsperado, 'w');
                    fs.writeSync(descriptor, conteudo);
                    fs.closeSync(descriptor);
                },1000);
            }
    
            var numeroTentativas = 0;
            var timerId = setInterval(function (){
                console.log('Verificando se arquivo '+ arquivoEsperado +' existe!');
                if(!fs.existsSync(arquivoEsperado)) {
                    numeroTentativas++;
                    if(numeroTentativas > 20) {
                        clearInterval(timerId);
                        return reject(new Error("SITEF não está respondendo. Verifique se os programas estão abertos e o pinpad ligado!"));
                    }
                    return;
                }
                console.log('Arquivo encontrado');
                clearInterval(timerId);
                var conteudo = fs.readFile(arquivoEsperado, (err, data) => {
                    if(err) {
                        return reject(new Error("Erro ao ler o arquivo "+ arquivoEsperado + "!"));
                    }
                    fs.unlinkSync(arquivoEsperado);
                    return resolve(data);
                });
                
            }, 400);
        });
    }

    passoP4() {
        return new Promise((resolve, reject) => {
            var arquivoEsperadoP4 = this.config.sitef.pastaDestinoResp + 'IntPos.001';
            var self = this;
            var timerArquivoP4 = setInterval(() => {
                console.log('Verificando se arquivo do passo P4 existe!');
                
                if(!fs.existsSync(arquivoEsperadoP4)) {
                    return;
                }
                console.log('Arquivo do passo P4 encontrado!');
                clearInterval(timerArquivoP4);
                var conteudo = fs.readFile(arquivoEsperadoP4, (err, data) => {
                    if(err) {
                        return reject(new Error("Erro ao ler o arquivo do passo P4!"));
                    }
                    fs.unlinkSync(arquivoEsperadoP4);

                    return resolve(data);
                });
            }, 500);
    
            if(this.debugSitef) {
                var origem = fs.realpathSync(this.config.sitef.pastaDestinoResp + '../IntPos.001');
                console.log(origem);
                setTimeout(function () {
                    console.log('Criando o arquivo do passo 4');
                    fs.createReadStream(origem).pipe(fs.createWriteStream(arquivoEsperadoP4));
                }, 1100);
            }
        });
    }
    
    enviarResposta (dados) {
        console.log('enviando resposta');
        this.socketio.emit('sitef_resposta', dados);
    }

    getRespostaPadrao () {
        return {
            error: 0,
            msg: null
        };
    }
}