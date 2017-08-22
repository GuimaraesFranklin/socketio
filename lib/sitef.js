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
        
        this.socketio.on('sitef_criar_arquivo', function (data){
            self.criarArquivo(data);
        });

        this.socketio.on('sitef_confirmar_impressao', function (data){
            self.confirmarImpressao(data);
        });
        
    }

    /**
     * TODO:
     * - Enviar erro de timeout quando o arquivo esperado nao for criado
     */
    
    criarArquivo (data) {

        var resposta = this.getRespostaPadrao();
        
        try{
            this.criarArquivoAguardarResposta(data, 'P2');
            this.passoP4();
        }catch(e) {
            resposta.error = 1;
            resposta.msg = e.toString();
            resposta.obj = e;
            this.enviarResposta(resposta);
        }
    }

    confirmarImpressao(dados) {
        this.criarArquivoAguardarResposta(dados, 'P7');
    }

    criarArquivoAguardarResposta(data, passo) {
        var conteudo = data.conteudoArquivo;
        console.log(conteudo)
        var destinoFinal = this.config.sitef.pastaDestinoReq + 'IntPos.001';
        
        if(data.arquivoDestino) {
            destinoFinal = data.arquivoDestino;
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
            console.log('verificando se arquivo existe!');
            if(!fs.existsSync(arquivoEsperado)) {
                return;
            }
            console.log('Arquivo encontrado');
            clearInterval(timerId);
            var conteudo = fs.readFile(arquivoEsperado, (err, data) => {
                if(err) {
                    return self.enviarResposta({error: 1, msg: "Erro ao ler o arquivo!", passo: passo});
                }
                fs.unlinkSync(arquivoEsperado);
                return self.enviarResposta({error: 0, msg: null, conteudoArquivo: data, passo: passo});
            });
            
        }, 400);
    }

    passoP4() {
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
                    return self.enviarResposta({error: 1, msg: "Erro ao ler o arquivo do passo P4!", passo: 'P4'});
                }
                fs.unlinkSync(arquivoEsperadoP4);
                return self.enviarResposta({error: 0, msg: null, conteudoArquivo: data, passo: 'P4'});
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