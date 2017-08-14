var config = {
    portaServidor: 8081,
    habilitarSSL: true,
    portaServidorSSL: 8081,
    debug: true,
    hostACBR: '127.0.0.1',
    executarShell: false,
    habilitarSuporteSitef: true,
    pastaDestinoArquivosSitef: '/var/www/socketio/tmp/',
    //pastaDestinoArquivosSitef: 'C:/Cliente/Req/',
    //comandoImpressao: "/var/www/socketio/imprimir.sh"
    comandoImpressao: "C:/onehost/socketio/imprimir.bat"
    //pastaDestinoArquivoSerial: "bin/daruma/",
};

module.exports = config;
