@ECHO OFF


::Execute python script
START C:\Virtual-Room\src\signal-server\signal_server.py > NUL %*

:: Run Web server
START C:\xampp\php\php.exe -S 0.0.0.0:3000 C:\Virtual-Room\test\routing.php > NUL %*
