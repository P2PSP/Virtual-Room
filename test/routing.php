<?php
if (preg_match_all('/\/(\w+\.*\w*\.*\w*\-*\w*\.*\w*)/', $_SERVER["REQUEST_URI"], $match)){
   switch ($match[1][0]) {
       case "room":
           include __DIR__ . '/../src/html/room.html';
       	   break;
       case "welcome":
           include __DIR__ . '/../src/html/index.html';
   	   break;
       case "css":
           header('Content-type: text/css');
   	   include __DIR__ . '/../src/css/'.$match[1][1];
	   break;
       case "js":
   	   include __DIR__ . '/../src/js/'.$match[1][1];
	   break;
       case "fonts":
           include __DIR__ . '/../src/fonts/'.$match[1][1].'/'.$match[1][2];
           break;
   }	
}else{
    header('Location: welcome');
}
?>