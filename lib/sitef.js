const fs = require('fs');
const path = require('path');
const os = require('os');

exports.init = function (socketio, config){
    new Sitef(socketio, config);
};

class Sitef {
    
    constructor (socketio, config) {
        this.socketio = socketio;
        this.adicionarEventos();
        this.isWindows = ! /linux/.test(os.platform());
        this.config = config;
        this.debugSitef = config.sitef.debug;
    }
    
    adicionarEventos () {
        let self = this;
        
        this.socketio.on('sitef_iniciar', function (data){
            self.iniciar(data);
        });
        
        this.socketio.on('sitef_criar_arquivo', function (data){
            self.criarArquivo(data);
        });
        
        this.socketio.on('sitef_ler_arquivo', function (data) {
            self.lerArquivo(data);
        });
        
        this.socketio.on('sitef_remover_arquivo', function (data){
            self.removerArquivo(data);
        });
        
        this.socketio.on('sitef_finalizar', function (data){
            self.finalizar(data);
        });
    }
    iniciar (data) {
        var resposta = this.getRespostaPadrao();
        this.enviarResposta(resposta);
    }

    criarArquivo (data) {
        var arquivoTmp = this.config.sitef.pastaDestino + 'IntPos.tmp';
        var destinoFinal = this.config.sitef.pastaDestino + 'IntPos.001';
        
        if(data.arquivoDestino) {
            destinoFinal = data.arquivoDestino;
        }
        
        var resposta = this.getRespostaPadrao();
        
        try{
            var descriptor = fs.openSync(arquivoTmp, 'w');
            fs.writeSync(descriptor, data.conteudo);
            fs.closeSync(descriptor);
            fs.renameSync(arquivoTmp, destinoFinal);
            var arquivoEsperado = this.config.sitef.pastaDestino + 'IntPos.STS';
            var self = this;

            if(this.debugSitef) {
                setInterval(function () {
                    var descriptor = fs.openSync(arquivoEsperado, 'w');
                    fs.writeSync(descriptor, data.conteudo);
                    fs.closeSync(descriptor);
                },1000);
            }

            var numeroTentativas = 0;
            var timerId = setInterval(function (){
                console.log('verificando se arquivo existe!');
                if(!fs.existsSync(arquivoEsperado)) {
                    return;
                }
                console.log('Arquivo encontrado');
                clearInterval(timerId);
                var conteudo = fs.readFile(arquivoEsperado, (err, data) => {
                    if(err) {
                        return self.enviarResposta({error: 1, msg: "Erro ao ler o arquivo!"});
                    }
                    return self.enviarResposta({error: 0, msg: null, conteudoArquivo: data});
                });
                
            }, 500);
        }catch(e) {
            resposta.error = 1;
            resposta.msg = e.toString();
            resposta.obj = e;
            this.enviarResposta(resposta);
        }
    }
    
    enviarResposta (dados) {
        console.log('enviando resposta');
        this.socketio.emit('sitef_resposta', dados);
    }
    
    lerArquivo (data) {
        
    }
    
    removerArquivo (data) {
        
    }

    getRespostaPadrao () {
        return {
            error: 0,
            msg: null
        };
    }
}