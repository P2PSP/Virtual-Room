# What is Virtual-Room?
A virtual room where friends share videos among them in real time directly over the web browser, with synchronized playback and a video chat at the same time.

# Features
- Share videos with your family and friends in a sincronized way at the same time that you keep a video-call with them. It's like to watch your favorite videos in the same room but virtually.
- Peer-to-Peer connection. Data is shared directly among browsers without pass thougth a server.
- MP4 fragmentation in the browser thanks to [MP4Box.js](https://github.com/gpac/mp4box.js) by Telecom ParisTech/TSI/MM/GPAC Cyril Concolato.
- Use of cuting edge technologies such as [P2PSP](http://p2psp.org), [WebRTC](https://webrtc.org/) and [MSE](https://www.w3.org/TR/media-source/). 

# Run the project in a built-in web server
## Prerequisites
```
$ sudo apt install php
```

## Run the back-end
Go to `test` directory and run:
```
$ ./test.me
```

## Run the front-end
Open the following URL in Chromium/Chrome browser (we are working on other browser compatibility):
```
http://127.0.0.1:3000/welcome
```

# Acknowledgment
This work is supported by Google Summer of Code 2017 initiative. See it on [GSoC Webpage](https://summerofcode.withgoogle.com/projects/#6720883738542080)  
Virtual-Room is based on an original idea and several experiments from P2PSP organization, which can be found at [WebRTC P2PSP repository](https://github.com/P2PSP/WebRTC) and [P2PSP WebRTC experiments](https://github.com/cristobalmedinalopez/p2psp-webrtc-experiments)

Enjoy!
