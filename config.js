var config = {
    portaServidor: 81,
    habilitarSSL: true,
    portaServidorSSL: 8082,
    debug: true,
    sitef: {
        habilitar: true,
        debug: false,
        //pastaDestinoReq: '/var/www/socketio/tmp/Req/',
        pastaDestinoReq: 'C:/Client/Req/',
        //pastaDestinoResp: '/var/www/socketio/tmp/Resp/',
        pastaDestinoResp: 'C:/Client/Resp/',
        pastaArquivosExemplo: 'C:/onehost/socketio/'
    },
    
    hostACBR: '127.0.0.1',
    executarShell: false,
    //comandoImpressao: "/var/www/socketio/imprimir.sh"
    comandoImpressao: "C:/onehost/socketio/imprimir.bat"
    //pastaDestinoArquivoSerial: "bin/daruma/",
};

module.exports = config;
