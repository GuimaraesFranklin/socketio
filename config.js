var config = {
    arquivoEntradaACBR: 'C:/ACBrMonitor/ENT.TXT',
    arquivoSaidaACBR: 'C:/ACBrMonitor/SAI.TXT',
    pastaACBR: 'C:/ACBrMonitor',
    portaServidor: 81,
    usarSockets: true,
    debug: true,
    caminhoImpressoraSerial: "LPT1",
    usarIconv: false,
    comandoImpressao: "/var/www/socketio/imprimir.sh-daruma"
};

module.exports = config;
