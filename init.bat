cd C:\onehost\socketio
START /B bin\node.exe init.js
cd bin\daruma
javaw -Djava.library.path="C:/onehost/socketio/bin/daruma/dll64" -jar DarumaDll.jar
