#mv imprimir.txt bin/daruma/
#cd bin/daruma/
#java -Djava.library.path="/home/gerson/libs/" -jar DarumaDll.jar

cat imprimir.txt > /dev/usb/lp1
rm -f  imprimir.txt
