# onehost-ecf

## Para todos os casos de impressora fiscal, executar (observe os caminhos, pode variar onde é instalado o programa devido a versão do Windows):

baixar de downloads.oneweb.com.br\socketio.zip
descompactacr em C:\onehost\socketio
- elgin precisa instalar o driver para ela aparecer na lista de impressoras como impressora, e não dispositivo
- compartilhar a impressora na rede, clicando com o direito nela, Propriedades da impressora, Compartilhamento, colocar um nome de compartilhamento simples, facil de memorizar, exemplo: ELGIN
- NO IMPRIMIR.BAT precisa corrigir no nome do compartilhamento, onde diz: type imprimir.txt >> \\nome-pc\impressora
para o nome correto daquele pc e da impressora. O nome do pc tem no icone "Computador" do iniciar, ou em outras areas.


- acessar pelo cmd a pasta c:\onehost\socketio e digitar bin\node\npm install --no-dev
- editar o init.bat e comentar ou apagar as linahs referente a impressora daruma, tirar o start /b da linha do node.exe
- instalar o serviço do windows (pde ser necessário abrir outra janela do cmd, clicando com o direito e executar como administrador): bin\nssm\win32\nssm.exe install servidor-cupom c:\onehost\socketio\init.bat  (talvez precisa usar o win64 do nssm). Verifique se o serviço já nao existe, pode ser que tenha algum legado. Remova ele com nssm.exe remove servidor-cupom
- digitar sc start servidor-cupom. Confira se esta escutando na porta especificada no arquivo config.js, exemplo: netstat -ant | find ":numero da porta"


## Para as emissoras de cupom nao fiscal direto
1. Configurar porta e velocidade correta em IniciarDarumaNaoFiscal.bat OU instalar uma impressora modo texto no windows 
2. Configurar para o windows inicializar corretamente o arquivo IniciarDarumaNaoFiscal.bat ou o passo anterior

## Para impressao pela DLL Daruma
1. Configurar produto, porta e velocidade correta em bin/daruma/DarumaFrameWork.xml. Caso esse arquivo não exista, deve-se rodar o servidor java no passo a seguir aí ele será automaticamente criado. Depois pare o servidor, e edite o XML.

1.1 Deve-se corrigir as tags <Produto> para DUAL, <PortaComunicacao> (tag dentro de DUAL) Para a porta COM onde se encontra a impressora e <Velocidade> para 115200

2 . Executar na inicialização do windows o arquivo inicarServidorJavaDaruma.bat que por sua vez irá rodar o servidor java que comunica com a DLL da Daruma

3. Arrumar o arquivo imprimir.bat para que mova o arquivo imprimir.txt para a pasta onde se encontra o arquivo .jar. Ver imprimir.bar-daruma, e renomear para imprimir.bat


##Para impressão de NFC-e da elgin é necessário mapear a impressora numa porta LPT quando a mesma for USB
net use LPT2 \\.\laser1 /persistent:yes
Aí no imprimir.bat usa type imprimir.txt > LPT2