var config = {
    "portaServidor": 81,
    "habilitarSSL": true,
    "portaServidorSSL": 8082,
    "debug": true,
    "pastaBase": __dirname,
    "pastaLogs": __dirname + '/logs/',
    "sitef": {
        "habilitar": true,
        "debug": true,
        "pastaDestinoReq": '/var/www/socketio/tmp/Req/',
        //"pastaDestinoReq": 'C:/Client/Req/',
        "pastaDestinoResp": '/var/www/socketio/tmp/Resp/',
        //"pastaDestinoResp": 'C:/Client/Resp/',
        "pastaArquivosExemplo": 'C:/onehost/socketio/'
    },
    "hostACBR": "127.0.0.1",
    "portaACBR": 3434,
    "executarShell": false,
    "comandoImpressao": "/var/www/socketio/imprimir.sh"
    //comandoImpressao: "C:/onehost/socketio/imprimir.bat"
    //pastaDestinoArquivoSerial: "bin/daruma/",
};

module.exports = config;
