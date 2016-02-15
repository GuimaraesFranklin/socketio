var app = require('http').createServer(handler)
        , io = require('socket.io').listen(app)
        , fs = require('fs')
        , util = require('util')
        , net = require('net')
        , exec = require('child_process').exec;

if (global.config.usarIconv) {
    var Iconv = require('iconv').Iconv;
    var Converter = new Iconv('utf-8', 'CP850');
}

var CupomId = 0;
var arquivoEntrada;
var arquivoSaida;
var pastaACBR;
var config;
var client = null;
var callback = function () {};
var callbackError = function () {};
var conectado = false;

exports.run = function () {
    config = global.config;
    arquivoEntrada = config.arquivoEntradaACBR;
    arquivoSaida = config.arquivoSaidaACBR;
    pastaACBR = config.pastaACBR;

    app.listen(config.portaServidor);

    if (config.usarSockets) {
        client = new net.Socket();
        conectarSocket();
        client.on('connect', function (e) {
            debug('Conectado!');
            conectado = true;
        });

        client.on('error', function (e) {
            callbackError('Erro na conexao!');
            setTimeout(conectarSocket, 5000);
            debug(e);
        });

        client.on('timeout', function (e) {
            conectado = false;
            callbackError('Timeout!');
            setTimeout(conectarSocket, 5000);
            debug(e);
        });

        client.on('data', function (retorno) {
            retorno = (retorno + '').trim().replace("\u0003", "");
            if (retorno.length === 0) {
                return;
            }

            callback([retorno]);
            debug('Resposta Recebida: ' + retorno);
        });

        client.on('end', function () {
            debug('client disconnected');
            conectado = false;
            callbackError('Desconectado!');
            setTimeout(conectarSocket, 5000);
        });
    }

    init();
};

function conectarSocket() {
    if(!config.usarACBR) {
        return;
    }
    if (!conectado) {
        client.connect(3434, '127.0.0.1');
    }
}

function handler(req, res) { }

function init() {
    io.sockets.on('connection', function (socket) {

        socket.emit('ready', {
            dados: 'hello'
        });

        socket.on('preparar_impressora', function (data) {
            removerArquivoSaida(function (err) {
                if (err) {
                    emitirErro(socket, err);
                } else {
                    socket.emit('impressora_pronta');
                }
            });
        });

        socket.on('remover_arquivo_saida', function (data) {
            removerArquivoSaida(function (err) {
                if (err) {
                    emitirErro(socket, err);
                } else {
                    socket.emit('arquivo_saida_removido');
                }
            });
        });

        socket.on('escrever_comando', function (data) {

            escreverComando(data.comando,
                    function (err) {
                        if (err) {
                            emitirErro(socket, err);
                        }
                    },
                    function (comando) {
                        socket.emit('retorno_comandos', {retorno: comando});
                    }
            );

        });

        socket.on('escrever_comandos', function (data) {
            escreverComandos(data.comandos,
                    function (err) {
                        if (err) {
                            emitirErro(socket, err);
                        }
                    },
                    function (comandos) {
                        socket.emit('retorno_comandos', {retorno: comandos});
                    }
            );
        });

        socket.on('emitir_cupom', function (cupom) {
            CupomId = cupom.id;
            escreverComandos(cupom.comandos,
                    function (err) {
                        if (err) {
                            emitirErro(socket, err);
                        }
                    },
                    function (comandos) {
                        socket.emit('retorno_comandos', {retorno: comandos});
                    }
            );
        });

        socket.on('ler_arquivo_saida', function (data) {
            lerArquivoSaida(function (err, data) {
                dados = {
                    retorno: data
                };
                socket.emit('retorno_arquivo_saida', dados);
            });
        });

        socket.on('enviar_comando_serial', function (data) {
            var str = data.comando;
            if (config.usarIconv) {
                str = Converter.convert(new Buffer(data.comando));
            }

            var arquivo = getArquivoDestinoComandoSerial();
            fs.writeFile(arquivo, str, function (err) {
                if (err) {
                    emitirErro(socket, err);
                    return;
                }

                if (config.comandoImpressao) {
                    executeCommand(config.comandoImpressao, [], function (result) {
                        console.log(result);
                    });
                }
                socket.emit('enviar_comando_serial_concluido', {retorno: 'OK'});
            });
        });
    });

}



function executeCommand(cmd, args, cb) {

    var spawn = require('child_process').spawn;
    var child = spawn(cmd, args);
    var result = '';

    child.stdout.on('data', function (buffer) {

        result += buffer.toString();

    });

    child.stdout.on('end', function () {

        cb(result);

    });

}

function removerArquivoSaida(callbackUnlink) {
    if (arquivoExiste(arquivoSaida)) {
        fs.unlink(arquivoSaida, callbackUnlink);
    } else {
        callbackUnlink(false);
    }
}

function lerArquivoSaida(callbackReadFile) {
    fs.readFile(arquivoSaida, 'utf-8', callbackReadFile);
}

function escreverComandos(comandos, callbackWriteFile, callbackRetornoComandos) {
    var retornos = [];

    var callbackRetorno = function (valores) {
        retornos.push(valores[0]);
        if (comandos.length > 0) {
            escreverComando(comandos.shift(), callbackWriteFile, callbackRetorno);
        } else {
            callbackRetornoComandos(retornos);
        }
    };

    escreverComando(comandos.shift(), callbackWriteFile, callbackRetorno);

}

function escreverComando(comando, callbackWriteFile, callbackRetornoComandos) {
    debug('Comando Recebido: ' + comando);

    if (config.usarSockets) {
        escreverComandoSocket(comando, callbackWriteFile, callbackRetornoComandos);
        return;
    }

    var enviar = comando + "\n";
    var enviouComando = false;

    removerArquivoSaida(function (erro) {
        var monitorPasta = fs.watch(pastaACBR, function (event, filename) {
            if (event === 'change' && filename === 'SAI.TXT') {
                lerArquivoSaida(function (err, data) {
                    if (typeof (data) === 'string') {
                        var retorno = data.trim();
                        if (!enviouComando) {
                            enviouComando = true;
                            callbackRetornoComandos([retorno]);
                            monitorPasta.close();
                        }
                    }
                });
            }
        });
        fs.writeFile(arquivoEntrada, enviar, 'utf-8', callbackWriteFile);
    });
}

function escreverComandoSocket(comando, callbackWriteFile, callbackRetornoComandos) {
    if (!conectado) {
        callbackWriteFile('Servidor desconectado!');
    }

    var enviar = comando + "\r\n.\r\n";
    callback = callbackRetornoComandos;
    callbackError = callbackWriteFile;
    client.write(enviar, 'utf-8');
}

function emitirErro(socket, erro) {
    socket.emit('erro', {msg: erro});
}

function debug(msg) {
    if (config.debug) {
        console.log(msg);
    }
}

function getArquivoDestinoComandoSerial() {
    var pasta = '';
    if (config.pastaDestinoArquivoSerial) {
        pasta = config.pastaDestinoArquivoSerial;
    }

    var destino = pasta + 'imprimir.txt';
    var c = 1;
    while (arquivoExiste(destino)) {
        destino = pasta + 'imprimir-' + c + '.txt';
        c++;
    }

    return destino;
}


function arquivoExiste(arquivo) {
    try {
        fs.statSync(arquivo);
        return true;
    } catch (err) {
        return !(err && err.code === 'ENOENT');
    }
}