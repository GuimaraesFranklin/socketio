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
    
    criarArquivo (data) {
        var arquivoTmp = this.config.pastaDestinoArquivosSitef + 'IntPos.tmp';
        var destinoFinal = this.config.pastaDestinoArquivosSitef + 'IntPos.001';
        
        if(data.arquivoDestino) {
            destinoFinal = data.arquivoDestino;
        }
        
        var resposta = {
            error: 0,
            msg: null
        };
        
        try{
            var descriptor = fs.openSync(arquivoTmp, 'w');
            fs.writeSync(descriptor, data.conteudo);
            fs.closeSync(descriptor);
            fs.renameSync(arquivoTmp, destinoFinal);
        }catch(e) {
            resposta.error = 1;
            resposta.msg = e.toString();
            resposta.obj = e;
        }
        
        this.enviarResposta(resposta);
    }
    
    enviarResposta (dados) {
        this.socketio.emit('sitef_resposta', dados);
    }
    
    lerArquivo (data) {
        
    }
    
    removerArquivo (data) {
        
    }
}