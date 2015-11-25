# onehost-ecf

## Para todos os casos, executar:
1. Criar a pasta C:\ACBrMonitor\socketio
2. Abrir o DOS e digitar cd C:\ACBrMonitor\socketio\bin
3. executar nssm.exe install servidor-cupom "C:\Arquivos de programas\nodejs\node.exe" C:\ACBrMonitor\socketio\init.js
4. net start servidor-cupom


## Para as emissoras de cupom nao fiscal direto
1. Configurar porta e velocidade correta em IniciarDarumaNaoFiscal.bat OU instalar uma impressora modo texto no windows 
2. Configurar para o windows inicializar corretamente o arquivo IniciarDarumaNaoFiscal.bat ou o passo anterior

## Para impressao pela DLL
1. Configurar porta e velocidade correta em DarumaFrameWork.xml
2. Arrumar o arquivo DarumaNaoFiscal.bat para imprimir pelo EXE


##Para impressão de NFC-e é necessário mapear a impressora numa porta LPT
net use lpt2 \\pserver\laser1 /persistent:yes