const fs = require('fs');
const net = require('net');
var SerialPort = require('serialport');
const https = require('https');
const http = require('http');

var app, config, client, io;
var callback = function () {};
var callbackError = function () {};
var conectado = false;

exports.run = function () {
    config = global.config;

    if(config.habilitarSSL) {
        const options = {
            key: fs.readFileSync(__dirname + '/../certs/key.pem'),
            cert: fs.readFileSync(__dirname + '/../certs/cert.pem'),
            passphrase: 'abcd'
        };
        app = https.createServer(options, handler);
        io = require('socket.io')(app);
        app.listen(config.portaServidorSSL);
        init();
        return;
    }
    
    app = http.createServer(handler);
    io = require('socket.io')(app);
    app.listen(config.portaServidor);
    init();
};

function conectarSocket() {
    if (!conectado) {
        client.connect(3434, config.hostACBR);
    }
}

function handler(req, res) { }

function init() {
    io.sockets.on('connection', function (socket) {

        socket.emit('ready', {
            dados: 'hello'
        });

        socket.on('preparar_impressora', function (data) {
            socket.emit('impressora_pronta');
        });

        socket.on('remover_arquivo_saida', function (data) {
            socket.emit('arquivo_saida_removido');
        });

        socket.on('ler_arquivo_saida', function (data) {
            socket.emit('retorno_arquivo_saida', {});
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

        socket.on('enviar_comando_serial', function (data) {
            var dados = data.comando;
            if (data.options && data.options.portaSerial) {

                debug('enviando para porta serial ' + data.options.portaSerial);
                
                var isCaminhoDeRede = /^\\\\/.test(data.options.portaSerial);
                if (isCaminhoDeRede) {
                    fs.writeFile(data.options.portaSerial, Buffer.from(dados), function (err) {
                        if (err) {
                            emitirErro(socket, err);
                            return;
                        }
                        socket.emit('enviar_comando_serial_concluido', {retorno: 'OK'});
                    });

                } else {

                    var callback = function (err) {
                        if (err) {
                            return console.log('Error opening port: ', err.message);
                        }
                        
                        try{
                            port.write(Buffer.from(dados), function (){
                                port.drain(function () {
                                    port.close();
                                    socket.emit('enviar_comando_serial_concluido', {retorno: 'OK'});
                                });
                            });
                        }catch(e) {
                            console.log('Erro ao escrever na porta serial: ' + e);
                        }
                    };
                    
                    try{
                        var tmp = {baudRate: 115200};
                        var port = new SerialPort(data.options.portaSerial, tmp, callback);
                    }catch(e) {
                        console.log('Erro ao abrir porta serial: ' + e);
                    }
                    
                }

                return;
            }

            var arquivo = getArquivoDestinoComandoSerial();
            var data = data;
            fs.writeFile(arquivo, Buffer.from(dados), function (err) {
                if (err) {
                    emitirErro(socket, err);
                    return;
                }

                if (config.comandoImpressao) {
                    executeCommand(config.comandoImpressao, function (result) {
                        console.log(result);
                    });
                }
                socket.emit('enviar_comando_serial_concluido', {retorno: 'OK'});
            });
        });
    });

}



function executeCommand(cmd, cb) {

    var exec = require('child_process').exec;
    var executarShell = typeof (config.executarShell) == "undefined" ? false : config.executarShell;
    exec(cmd, {'shell': executarShell}, function (error, stdout, stderr) {
        cb(stdout);
    });
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
    var enviar = comando + "\r\n.\r\n";
    callback = callbackRetornoComandos;
    callbackError = callbackWriteFile;

    if (!conectado) {
        debug('Comando recebido porém não conectado. Efetuando conexão...');
        configurarClienteACBR(function () {
            debug('Conectado. Enviando ' + enviar);
            client.write(enviar, 'utf-8');
        });
    }

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

function configurarClienteACBR(callbackConnected) {
    client = new net.Socket();

    conectarSocket();

    var callbackConnected = callbackConnected;

    client.on('connect', function (e) {
        debug('Conectado!');
        conectado = true;
        if (callbackConnected) {
            callbackConnected(client);
        }
    });

    client.on('error', function (e) {
        callbackError('Erro na conexao!');
        //setTimeout(conectarSocket, 5000);
        debug(e);
    });

    client.on('timeout', function (e) {
        conectado = false;
        callbackError('Timeout!');
        //setTimeout(conectarSocket, 5000);
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
        //setTimeout(conectarSocket, 5000);
    });

    client.on('close', function () {
        debug('Conexão fechada');
        conectado = false;
        callbackError('Conexão fechada!');
        //setTimeout(conectarSocket, 5000);
    });
}