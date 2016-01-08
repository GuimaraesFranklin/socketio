# onehost-ecf

## Para todos os casos de impressora fiscal, executar (observe os caminhos, pode variar onde é instalado o programa devido a versão do Windows):
1. Criar a pasta C:\ACBrMonitor\socketio
2. Abrir o DOS e digitar cd C:\ACBrMonitor\socketio\bin
3. executar nssm.exe install servidor-cupom "C:\Arquivos de programas\nodejs\node.exe" C:\ACBrMonitor\socketio\init.js
4. net start servidor-cupom


## Para as emissoras de cupom nao fiscal direto
1. Configurar porta e velocidade correta em IniciarDarumaNaoFiscal.bat OU instalar uma impressora modo texto no windows 
2. Configurar para o windows inicializar corretamente o arquivo IniciarDarumaNaoFiscal.bat ou o passo anterior

## Para impressao pela DLL Daruma
1. Configurar produto, porta e velocidade correta em bin/daruma/DarumaFrameWork.xml. Caso esse arquivo não exista, deve-se rodar o servidor java no passo a seguir aí ele será automaticamente criado. Depois pare o servidor, e edite o XML.

1.1 Deve-se corrigir as tags <Produto> para DUAL, <PortaComunicacao> (tag dentro de DUAL) Para a porta COM onde se encontra a impressora e <Velocidade> para 115200

2 . Executar na inicialização do windows o arquivo inicarServidorJavaDaruma.bat que por sua vez irá rodar o servidor java que comunica com a DLL da Daruma

3. Arrumar o arquivo imprimir.bat para que mova o arquivo imprimir.txt para a pasta onde se encontra o arquivo .jar. Ver imprimir.bar-daruma, e renomear para imprimir.bat


##Para impressão de NFC-e da elgin é necessário mapear a impressora numa porta LPT quando a mesma for USB
net use lpt2 \\pserver\laser1 /persistent:yes
Aí no imprimir.bat usa type imrpimir.txt > LPT2