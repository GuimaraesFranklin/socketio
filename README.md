# onehost-ecf

## Para todos os casos de não impressora fiscal, executar (observe os caminhos, pode variar onde é instalado o programa devido a versão do Windows):

1- Baixar de http://downloads.oneweb.com.br/socketio.zip
descompactar em C:\onehost\socketio

2 - Fazer download do nodejs versão 8.9.x em https://nodejs.org/en/ Tente a versão 32 bits

3 - Cadastrar corretamente o terminal em http://...../admin/ow_cupom_fiscal/ecf_terminais

### Impressora Elgin
- Precisa instalar o driver para ela aparecer na lista de impressoras como impressora, e não dispositivo. Link: https://www.elgin.com.br/portalelgin/site/Contato/Suporte/DownloadCenter.aspx?Divisao=1&sm=cbda_1
A impressora mais comum deles é a LEGIN I9

- compartilhar a impressora na rede, clicando com o direito nela, Propriedades da impressora, Compartilhamento, colocar um nome de compartilhamento simples, facil de memorizar, exemplo: ELGIN
- No arquivo IMPRIMIR.BAT precisa corrigir no nome do compartilhamento, onde diz: type imprimir.txt >> \\nome-pc\impressora
para o nome correto daquele **PC** e da **impressora**. O nome do pc tem no icone "Computador" do iniciar, ou em outras areas.


- acessar pelo cmd a pasta `c:\onehost\socketio e digitar npm install --production`
- editar o init.bat e comentar ou apagar as linhas referente a impressora daruma, tirar o start /b da linha do node.exe, caso necessário.
- instalar o serviço do windows (pde ser necessário abrir outra janela do cmd, clicando com o direito e executar como administrador): `bin\nssm\win32\nssm.exe install servidor-cupom c:\onehost\socketio\init.bat`  (talvez precisa usar o win64 do nssm). Verifique se o serviço já nao existe, pode ser que tenha algum legado. Remova ele com nssm.exe remove servidor-cupom
- digitar `sc start servidor-cupom`. Confira se esta escutando na porta especificada no arquivo config.js, exemplo: netstat -ant | find ":81"

### Impressora Bematech
- Verificar no painel de controle em qual porta COM ela está configurada.
- Editar o Terminal e colocar lá a porta COM respectiva

### Para impressao pela Daruma
1. Configurar produto, porta e velocidade correta em bin/daruma/(dll32|dll64)/DarumaFrameWork.xml. Caso esse arquivo não exista, deve-se rodar o servidor java no passo a seguir aí ele será automaticamente criado. Depois pare o servidor, e edite o XML.

1.1 Deve-se corrigir as tags \<Produto> para DUAL, \<PortaComunicacao> (tag dentro de DUAL) Para a porta COM onde se encontra a impressora e \<Velocidade> para 115200

2 . Descomentar as linhas no arquivo init.bat que iniciam o servidor java. Atentem para não iniciar o servidor após chamar o servidor nodejs sem ser em background.

3 . Arrumar o arquivo imprimir.bat para que mova o arquivo imprimir.txt para a pasta onde se encontra o arquivo .jar. Ou mudar o parâmetro pastaDestinoArquivoSerial em config.js

