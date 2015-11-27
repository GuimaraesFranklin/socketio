# onehost-ecf

## Para todos os casos, executar:
1. Criar a pasta C:\ACBrMonitor\socketio
2. Abrir o DOS e digitar cd C:\ACBrMonitor\socketio\bin
3. executar nssm.exe install servidor-cupom "C:\Arquivos de programas\nodejs\node.exe" C:\ACBrMonitor\socketio\init.js
4. net start servidor-cupom


## Para as emissoras de cupom nao fiscal direto
1. Configurar porta e velocidade correta em IniciarDarumaNaoFiscal.bat OU instalar uma impressora modo texto no windows 
2. Configurar para o windows inicializar corretamente o arquivo IniciarDarumaNaoFiscal.bat ou o passo anterior

## Para impressao pela DLL Daruma
1. Configurar porta e velocidade correta em bin/daruma/DarumaFrameWork.xml

1.1 Deve-se corrigir as tags <Produto>, <PortaComunicacao> do respectivo produto e <Velocidade> 

2 . Executar na inicialização do windows: 
```
cd bin/daruma/
javaw -Djava.library.path="CAMINHO COMPLETO PARA A PASTA bin/daruma/dll" -jar DarumaDll.jar
```
3. Arrumar o arquivo imprimir.bat para que mova o arquivo imprimir.txt para a pasta onde se encontra o arquivo .jar


##Para impressão de NFC-e é necessário mapear a impressora numa porta LPT
net use lpt2 \\pserver\laser1 /persistent:yes