var config = {
    portaServidor: 8081,
    habilitarSSL: true,
    portaServidorSSL: 8081,
    debug: true,
    sitef: {
        habilitar: true,
        debug: true,
        pastaDestino: '/var/www/socketio/tmp/',
        //pastaDestino: 'C:/Cliente/Req/',
    },
    
    hostACBR: '127.0.0.1',
    executarShell: false,
    //comandoImpressao: "/var/www/socketio/imprimir.sh"
    comandoImpressao: "C:/onehost/socketio/imprimir.bat"
    //pastaDestinoArquivoSerial: "bin/daruma/",
};

module.exports = config;
