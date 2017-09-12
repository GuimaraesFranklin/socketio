cd C:\onehost\socketio
bin\node\npm install
START /B bin\node\node.exe init.js
cd bin\daruma
javaw -Djava.library.path="C:/onehost/socketio/bin/daruma/dll64" -jar DarumaDll.jar
