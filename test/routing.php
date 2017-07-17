<?php
if (preg_match('/room\/new\/[0-9A-Fa-f]*/', $_SERVER["REQUEST_URI"])) {
    include __DIR__ . '/../src/html/room.html';
}else if(preg_match('/room\/room.html/', $_SERVER["REQUEST_URI"])){
      include __DIR__ . '/../src/html/room.html';
}else if(preg_match('/room\/welcome/', $_SERVER["REQUEST_URI"])){
      include __DIR__ . '/../src/html/index.html';
}else if(preg_match('/room\/([a-zA-Z]+)\/(.*)/', $_SERVER["REQUEST_URI"], $macth) || preg_match('/([a-zA-Z]+)\/(.*)/', $_SERVER["REQUEST_URI"], $macth)){
    $path = __DIR__.'/../src/'.$macth[1].'/'.$macth[2];
    if ($macth[1] == "css"){
       header('Content-type: text/css');
    }
    include $path;
}
?>