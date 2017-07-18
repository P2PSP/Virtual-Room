var vid = document.getElementById("video-stream"); // Video to be streamed
var vidHeight = vid.getAttribute("height");
var vidWidth = vid.getAttribute("width");
var vidFile = document.getElementById("video-file");
var broadcastURL = document.getElementById("broadcast-url");
var baseURL = "http://127.0.0.1:3000/room/new/"; // Will be changed accordingly
var homeURL = "http://127.0.0.1:3000/room/welcome/";
var peerID = 'xxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // Generating UUID(taking only the first section of the string) according to the RFC4122 version 4(https://www.ietf.org/rfc/rfc4122.txt)
var vidToWindowRatio;
var aspectRatio;
var videoLoaded;
var serverConfig = {iceServers: [{ url: 'stun:stun.l.google.com:19302' }]};
var peersInRoom = [];
var peerNum = document.getElementById("peer-num");
var senderID;
var mimeCodec = 'video/mp4; codecs="avc1.4D4029"';
var outBuffer = new Array(); 
var sourceBuffer = null;
var chunkSize = 16*1024; // 16kb
var signalServer;
var peerConnection = [];
var peerConnections = [];
var peerIDServer;
var peerChannel = [];
var maxQueueSize = 512; // Considering max peers are 256 and having a safe buffer of 4 chunks/peer before any element in the queue is been replaced
var queue = new Array(maxQueueSize);
var chunkToPlay = 0;
var peerIndex = 0; // The index of array peerConnections
var mp4box;
var constraints = {'video': true, 'audio': true}; // Have to play with audio constraints, since the peer should not be able to hear hi own voice, but the peers should receive user audio
var localStream; // The stream getting through getUserMedia for video calling

console.log(peerID);

if (window.location.href.length - peerID.length == baseURL.length){
	console.log("peer is not sender");
	var windowLocation = window.location.href;
	senderID = windowLocation.replace(baseURL, "");
	console.log(senderID);
	vidFile.disabled = true;
	var streambtn = document.getElementById("stream");
	streambtn.disabled = true;
}else{
	history.replaceState('', '', baseURL + peerID);
	console.log("peer is sender");
	senderID = peerID;
}

generateURL();
preInititiation();

// if there is a new user he will be directed to base url as he makes a virtual room, and if an new peer joins existing room we assign sender id according to the window location
var currentPeer;

// add pause listener to the video player
function addPauseListener(){
    vid.onpause = function(){
    	var event = "pause";
    	vidPlayBack(event);
    }
}

// add play listener to the video player
function addPlayListener(){
    vid.onplay = function(){
    	var event = "play";
    	vidPlayBack(event);
    }
}

window.onload = function(){
	console.log("window loaded");
	mp4box = new MP4Box();
    vid.addEventListener('canplay', function () {
            vid.play();
    });
    addPauseListener();
    addPlayListener();
// 	history.replaceState('', '', baseURL + peerID);
// 	generateURL();
// 	preInititiation();
};

signalServer.onopen = function(){
	// on connecting to signal server add peer to room/add room 
	// handling the case of host user to differentiate with normal peers
	if (peerID == senderID){
		signalServer.send(JSON.stringify({"addRoom": true, "roomID": senderID}));
	}else{
		signalServer.send(JSON.stringify({"verifyRoom": "not verified", "roomID": senderID})); // message sent only if peer comes by direct link
	}
	signalServer.send(JSON.stringify({"peerID": peerID, "addPeer": true, "roomID": senderID}));
};

// Check if all required API's are available in the peer's browser

window.MediaSource = window.MediaSource || window.WebKitMediaSource;
if (!!!window.MediaSource) {
  alert('MediaSource API is not available :_(');
  Materialize.toast("OOPS! You may not be able to access all the features of the room");
}

window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription;
if (!!!window.RTCPeerConnection || !!!window.RTCIceCandidate || !!!window.RTCSessionDescription) {
  alert('WebRTC API is not available :_(');
  Materialize.toast("OOPS! You may not be able to access all the features of the room");
}

signalServer.onmessage = function (message){
	console.log("message received");
	handleMessage(message);
};


// Used for messages apart from peer connections, for peer connection refer to gotMessageFromServer()
function handleMessage(message){
	var decodedMessage = new TextDecoder().decode(new Uint8Array(message.data));
	parsedMessage = JSON.parse(decodedMessage);
	console.log(parsedMessage);

	if (parsedMessage.signalConnection){
		gotMessageFromServer(parsedMessage);
	};

	if (parsedMessage.roomExists=="false"){
		Materialize.toast("OOPS! We couldn't find a room with this url", 2000, '',function(){
		window.location.href = "http://127.0.0.1:3000/src/html/room.html";
	});
	};

	// Initiating multiple connections with peer for new peer 
	if (parsedMessage.peer_id_list){

		peerIDList = parsedMessage.peer_id_list;
		console.log(peerIDList);
		var currentPeerNum; // defining the peerConnection index
		peerIDServer = peerIDList.pop(); // an array containing peer ids excluding that of the receiving peer 
		console.log(peerIDList);
		if (peerIDServer==0){
			console.log("The host peer");
		}else{
			console.log(peerIDList);
			// peerIDList.shift(); // an array containing peer ids excluding that of the receiving peer and of the host
			peerConnections = peerIDList; // peer ID list on initiating the rtc connection by a new peer
			console.log(peerConnections);
			for (currentPeerNum = 0; currentPeerNum<peerConnections.length; currentPeerNum++){
					currentPeer = peerConnections[currentPeerNum]
					console.log(currentPeer);
					initiatePeerConnection(currentPeer, createDataChannel);
				};
		}
	};

	if (parsedMessage.message){
		Materialize.toast(parsedMessage.message, 2000);
	};

	// if (parsedMessage.newPeer){
	// 	server_id = parseInt(parsedMessage.server_id)
	// 	peersInRoom[server_id] = {"connection": ""}
	// }

}


// Filling placeholders after the video has been loaded
vid.addEventListener("loadedmetadata", function(e){
	videoLoaded = true;
	aspectRatio = vid.videoWidth/vid.videoHeight;
	vidToWindowRatio = (vid.videoHeight/screen.height).toFixed(3);
	var newHeight = (window.outerHeight*vidToWindowRatio);
	var newWidth = newHeight*aspectRatio;
	widthChange(newWidth); // Set the video frame size as per the aspect ratio of the video
	console.log(window.outerHeight);
	console.log(screen.height);
},false);

window.onresize = function(){
	if (videoLoaded) {
		console.log(vidToWindowRatio);
		console.log(aspectRatio);
		var newHeight = (window.outerHeight*vidToWindowRatio);
		var newWidth = newHeight*aspectRatio;
		console.log(newWidth);
		widthChange(newWidth);
	} else {
		console.log("video not loaded");
	}
};

function widthChange(width){
    vid.setAttribute("width",width);
}

vidFile.onchange = function(){
		console.log("video stream change");
		var streambtn = document.getElementById("stream");
		vid.setAttribute("controls", "");
	    streambtn.setAttribute("class", "btn-flat waves-effect waves-light red");
    };

function streamVideo(){
	// Make a separate function to load the video and call it in the main streamVideo() function
	// var source = document.getElementById("video-source");
	// vid.play();
	fragmentMP4();
}

function copyBroadcastURL(){
	generateURL();
	var range = document.createRange();
	range.selectNode(broadcastURL);
	console.log(range);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand("copy");
	Materialize.toast("Link copied to clipboard", 1000);
}

// Function to be modified to contain logic of generating url
function generateURL(){
	broadcastURL.innerHTML = baseURL+senderID;
}

// disconnect the peer from the room
function disconnectPeer(){
	window.location.href = homeURL;
}

// Updating the number of peers and getting stream from the peer on connecting to other peers
// Should be updated such that the current peer doesn't have his/her user media appended as a video element in the current page
function addPeer(){
	var peerMediaElements = document.getElementById("peer-media-banner");
	// peerNumUpdated = parseInt(peerNum)+1;
	var peerMediaDiv = document.createElement("div");
	var peerMediaVideo = document.createElement("video");
	peerMediaVideo.setAttribute("class", "z-depth-5");
	var peerMediaSource = document.createElement("source");
	peerMediaVideo.setAttribute("height", "150");
	// peerMediaSource.src = "../bbb-cbr-1300-frag.mp4"; // to be updated with UserMedia
	peerMediaSource.id = "user-media-"+peerID;
	peerMediaVideo.appendChild(peerMediaSource);
	peerMediaDiv.setAttribute("class", "col s4");
	peerMediaDiv.appendChild(peerMediaVideo); 
	peerMediaElements.appendChild(peerMediaDiv);
	peersInRoom[peerNum].peerID = peerID;
	peerNum = peerNumUpdated;
}	


// ------------------------Fragmenting MP4 in the browser--------------------------------

if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)){
	console.log("media source object made");
	var mediaSource = new MediaSource();
}else{
	console.log('false');
}

function fragmentMP4(){
	// Need to be specific for Blink regarding codecs
	if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
	    //create an URL (from mediaSource OBJ) as video's source
	    vid.src = URL.createObjectURL(mediaSource);
	    mediaSource.addEventListener('sourceopen', setSourceBuffer);
	}else{
    	console.error('Unsupported MIME type or codec: ', mimeCodec);
	}

	onFragment();
}

if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
    //create an URL (from mediaSource OBJ) as video's source
    vid.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', setSourceBuffer);
}else{
	console.error('Unsupported MIME type or codec: ', mimeCodec);
}

function setSourceBuffer(){
	console.log("source open");
	if(peerID!=senderID){
		mimeCodec = 'video/mp4; codecs="avc1.4D4029"'
	}
	// if(sourceBuffer==null){
	    sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
	    sourceBuffer.segmentIndex = 0;
	    sourceBuffer.AppendMode = "sequence";
	    sourceBuffer.mode = "sequence";
	// }

}

function onFragment(_) {
    console.log("open");
    var videoFile = vidFile.files[0];
	// var vidURL = URL.createObjectURL(videoFile);
	// vid.src = vidURL;
	// vid.play();
	// if (vid.readyState > 0){
	//     console.log(vid.duration);
	// }
    console.log(videoFile.size);
    var fileRead = new FileReader();
    fileRead.readAsArrayBuffer(videoFile);
    console.log("playback rate = "+vid.playbackRate);
    fileRead.onloadend = function (evt) {
        console.log("2.on response"); 
        var mp4box = new MP4Box();
        var initializeSegments ;  
        var updateCount = 0;
        var bytesAppended = 0;
        var chunkEndTime = []; // Containing different chunks end time
		var currentChunk = 0
		var chunkStartTime = 0
        sourceBuffer.addEventListener('updateend', function (_) {
            if(updateCount < initializeSegments[0].user.segmentIndex){
            	try{
            		if(!sourceBuffer.updating){
            			console.log(sourceBuffer);
		                console.log("8.append_cnt:"+updateCount);
		                console.log(outBuffer[updateCount]);
		                var chunk = outBuffer[updateCount];
		                sourceBuffer.appendBuffer(outBuffer[updateCount]); 
		                bytesAppended += outBuffer[updateCount].byteLength; // outBuffer[updateCount].byteLength is the bytes of current chunk appended
		                console.log(bytesAppended);
		                console.log(durationInSeconds);
		                chunkEndTime[updateCount] = bytesAppended*(durationInSeconds/videoFile.size)
		                // console.log(chunkEndTime);
		                if(updateCount == 0){
    		                vid.play();
    		            };
		                readyChunk(chunk, updateCount+1); // send chunk to data channel to transmit to other peers
		                updateCount++;
		                // console.log("video played");
		            }
	            }
    	        catch(e){
    	        	console.log(e);
    	        	if (e.name == "QuotaExceededError"){
    	        		console.log("clean buffer");
    	        		// var prevChunkEndTime = Math.max.apply(Math, chunkEndTime.filter(function(x){return x <= vid.currentTime}));
    	        		// var currentChunk = chunkEndTime.indexOf(prevChunkEndTime);
    	        		if (vid.currentTime < chunkEndTime[currentChunk]){
    	        			// await sleep(chunkEndTime - vid.currentTime);
    	        			console.log(chunkStartTime, chunkEndTime[currentChunk]);
    	        			cleanBuffer(chunkStartTime, chunkEndTime[currentChunk]);
    	        			currentChunk++;
    	        			chunkStartTime = chunkEndTime[currentChunk-1];
    	        		}else{
    	        			console.log(chunkStartTime, chunkEndTime[currentChunk]);
	    	        		cleanBuffer(chunkStartTime, chunkEndTime[currentChunk]);
	    	        		currentChunk++;
	    	        		chunkStartTime = chunkEndTime[currentChunk-1];
	    	        	}
    	        	}
    	        }
    	        finally{
            		if(!sourceBuffer.updating){
		                console.log("8.append_cnt:"+updateCount);
		                console.log(outBuffer[updateCount]);
		                sourceBuffer.appendBuffer(outBuffer[updateCount]);
		                var chunk = outBuffer[updateCount];
		                readyChunk(chunk, updateCount+1); // send chunk to data channel to transmit to other peers
		                bytesAppended+=outBuffer[updateCount].byteLength; // outBuffer[updateCount].byteLength is the bytes of current chunk appended
		                chunkEndTime[updateCount] = Math.ceil(bytesAppended*(videoFile.size/durationInSeconds))
		                updateCount++;
		                // console.log("video played");
		            }
	            }
            }else{
                console.log("9.start play");
            }
        });
        mp4box.onMoovStart = function () {
            console.log("4.Starting to receive File Information");
        };
        var durationInSeconds;
        mp4box.onReady = function(info) {
        	console.log(info);
        	// calculating duration in seconds according to the timescale of the video
        	durationInSeconds = info.duration/info.timescale;
            console.log("5.info.mime:"+info.mime);
            console.log(info.codecs);
            mp4box.onSegment = function (id, user, buffer, sampleNum) {
                console.log("Received segment on track "+id+" for object "+user+" with a length of "+buffer.byteLength+",sampleNum="+sampleNum);
                console.log("user.segmentIndex:"+user.segmentIndex);
                var numChunks = Math.ceil(buffer.byteLength/16380); //16384 bytes = 16kb
                var currentByte = 0
                for(currentChunk = 0; currentChunk < numChunks; currentChunk++){
                    outBuffer[user.segmentIndex] = buffer.slice(currentByte, currentByte+16380);
                    currentByte+=16380;
                    //user.appendBuffer(outBuffer[user.segmentIndex]); 
                    user.segmentIndex++;
                }
            }; 

            var nbSamples = Math.ceil((durationInSeconds/peerNum)*24); //assuming 24 fps
            if (videoFile.size/peerNum > 1048576*149){ // if a chunk size exceeds 150 mb, sourcebuffer quota exceeds
            	var divideNbSamplesBy = Math.ceil(videoFile.size/1048576*150); // 1 MB = 1048576 bytes
            	nbSamples = nbSamples/divideNbSamplesBy;
            }
            console.log(nbSamples);
            var options = { nbSamples: nbSamples };
            mp4box.setSegmentOptions(info.tracks[0].id, sourceBuffer, options);  
            initializeSegments = mp4box.initializeSegmentation();  
            console.log("starting");
            mp4box.start();
            console.log("start->stop");
            mp4box.flush();
            console.log("6.mp4 processing end"); 
        };

        var ab = evt.target.result;
        console.log(ab);
        ab.fileStart = 0;
        console.log("3.mp4 appendBuffer start,start point:"+nextBufferStart); 
        var nextBufferStart = mp4box.appendBuffer(ab);
            
        console.log("7.source buffer appendBuffer start:"); 
        console.log(initializeSegments[0].buffer);
        sourceBuffer.appendBuffer(initializeSegments[0].buffer); 
        readyChunk(initializeSegments[0].buffer, 0);
    };
    console.log("1.on send"); 
}

// ------------------------Finished fragmentation---------------------------------------

// ------------------------Connecting Peers---------------------------------------------

// Function to avoid confusions about new peers and creator of the room
function preInititiation(){
	signalServer = new WebSocket("ws://127.0.0.1:8000/"); // Set to local websocket for now
	signalServer.binaryType = "arraybuffer";
	// setTimeout(function(){
	// signalServer.onopen = function(){
		if (peerID != senderID){
			currentPeer = 0; // Since server ID of the host will always be 0 for a new room
			// addPeer();    // Will resume this function while on the feature of video calling
			console.log("initiating connection with host peer")
			// initiatePeerConnection(peerID);
		}else{
			navigator.getUserMedia(constraints, function(stream){
				localStream = stream;
				console.log(localStream);
				gotLocalStream(localStream, currentPeer);
			}, logError);
			console.log(signalServer.readyState);
			// signalServer.send(JSON.stringify({"addRoom": true, "roomID": peerID}));
		}
	// };
	// }, 2000);
}


// Initiating peer connection with the host
function initiatePeerConnection(currentPeer, callback){
	peerConnection[currentPeer] = new RTCPeerConnection(serverConfig); // Initiation of RTC connection of peers other than host

	console.log(peerConnection[currentPeer]);
	console.log(currentPeer);


	peerConnection[currentPeer].onicecandidate = function(evt){
		console.log("ice candidate");
		console.log(peerID);
		signalServer.send(JSON.stringify({"candidate": evt.candidate, "peerID": peerID, "senderID": senderID, "sendTo": currentPeer}));
	};

	peerConnection[currentPeer].onnegotiationneeded = function(){
		console.log("negotiation initiated"+currentPeer.toString());
		peerConnection[currentPeer].createOffer()
		.then(function(offer){
			peerConnection[currentPeer].setLocalDescription(offer)
		})
		.then(function(){
			console.log("offer sent to "+currentPeer.toString());
			console.log(peerID);
			console.log(peerConnection[currentPeer].localDescription);
			signalServer.send(JSON.stringify({"sessionDescriptionProtocol": peerConnection[currentPeer].localDescription, "peerID": peerID, "senderID": senderID, "sendTo": currentPeer}));
			console.log("Done negotiation");
		})
		.catch(logError)
	};
	// console.log(localStream);
	// peerConnection[currentPeer].addStream(localStream);
	// peerConnection[currentPeer].ontrack = gotRemoteStream;
	navigator.getUserMedia(constraints, function(stream){
		localStream = stream;
		console.log(localStream);
		gotLocalStream(localStream, currentPeer);
	}, logError);

	peerConnection[currentPeer].ontrack = function(e){
		console.log("on track");
		gotRemoteStream(e);
	};
	callback(currentPeer, setupChannel); // callback is createDataChannel. calling the callback with setupChannel
}

// Sending offer to connect(As a callback to createLocalDescription)
function sendOffer(){
	console.log('offer sent')
	console.log(peerID);
	signalServer.send(JSON.stringify({"sessionDescriptionProtocol": peerConnection[currentPeer].localDescription, "peerID": peerID, "senderID": senderID, "sendTo": currentPeer}));
}

// Create Local description for a new peer in the room(Generate Local description containing session description protocol)
function createLocalDescription(offer){
	peerConnection[currentPeer].setLocalDescription(offer)
	.then(function(){
		console.log("offer sent to "+currentPeer.toString());
		console.log(peerID);
		console.log(peerConnection[currentPeer].localDescription);
		signalServer.send(JSON.stringify({"sessionDescriptionProtocol": peerConnection[currentPeer].localDescription, "peerID": peerID, "senderID": senderID, "sendTo": currentPeer}));
		console.log("Done");
	})
	// sendOffer();
}

// handle message from server to create connections
function gotMessageFromServer(message) {
    // if(!currentPeer) start(false);
    // Getting parsed message from handleMessage

    currentPeer = parseInt(message.server_id); // server ID
    if (!peerConnection[currentPeer]){ // ice candidate may fire multiple times along with sdp, we want to establish one connection per peer
        peerConnection[currentPeer] = new RTCPeerConnection(serverConfig);

		peerConnection[currentPeer].ontrack = function(e){
			console.log("on track");
			gotRemoteStream(e);
		};

		window.localStream.getTracks().forEach(
			function(track) {
				console.log("adding stream to "+currentPeer);
				console.log(peerConnection[currentPeer]);
				peerConnection[currentPeer].addTrack(
					track,
					window.localStream
				);
			}
		);
		
        console.log(currentPeer);
        console.log(peerConnection[currentPeer]);
    }

    if(message.sessionDescriptionProtocol) {
        peerConnection[currentPeer].setRemoteDescription(new RTCSessionDescription(message.sessionDescriptionProtocol), function() {
            if(message.sessionDescriptionProtocol.type == 'offer') {
                peerConnection[currentPeer].createAnswer().then(function(offer){
                	createLocalDescription(offer);
                })
                .catch(logError)
            }else{
            	console.log(currentPeer);
            	peerConnection[currentPeer].setRemoteDescription(message.sessionDescriptionProtocol)
            	.catch(logError);
            }

        });
    } else if(message.candidate) {
    	console.log("adding");
        peerConnection[currentPeer].addIceCandidate(new RTCIceCandidate(message.candidate));
    	console.log("added");
    }


    // setupDataChannel(currentPeer);
	peerConnection[currentPeer].ondatachannel = function (event) {
		console.log("on data channel");
		peerConnections.push(currentPeer);
		console.log(peerConnections);
		peerChannel[currentPeer] = event.channel;
	    console.log(peerConnection[currentPeer]);
		setupChannel(currentPeer);

	};
}

function logError(e) {
    console.log("error occured "+e.name + "with message " + e.message);
}

function cleanBuffer(chunkStart, chunkEnd){
	if(!sourceBuffer.updating){
		console.log(sourceBuffer);
		console.log("start"+chunkStart+" end"+chunkEnd)
		console.log("buffer removing")
		sourceBuffer.remove(parseFloat(chunkStart.toFixed(2)), parseFloat(chunkEnd.toFixed(2)));
		console.log("Buffer removed from "+chunkStart+" sec to "+chunkEnd+" sec");
	}
}

function createDataChannel(currentPeer, callback){
	console.log("creating data channel");
	dataChannelOptions = {
		'id': currentPeer
	};
	peerChannel[currentPeer] = peerConnection[currentPeer].createDataChannel("Channel"+currentPeer, dataChannelOptions);
	callback(currentPeer); // callback is always setupChannel
	console.log(peerChannel[currentPeer]);
}


// Send chunk to the appropriate peer according to round robin scheduling
// the chunk must be sent such that (senderID+numChunk)%(total number of peers)=0
function sendChunk(chunk){
	var senderID = chunk.slice(0,1)[0];
	console.log(senderID);
	var chunkNum = chunk.slice(1,2)[0];
	console.log(chunkNum);
	var streamSend = chunk.slice(2);
	console.log(peerConnections);

	if(senderID == 0){ // round robin when splitter sends the chunk
		peerIndex = (chunkNum)%(peerConnections.length);
		try{
			console.log(peerChannel);
			console.log(peerChannel[peerConnections[peerIndex]]);
			console.log(chunk.slice(1,2)[0]);
			peerChannel[peerConnections[peerIndex]].send(chunk);
		}
		catch(e){
			console.log(e);
			Materialize.toast("The peer with ID "+peerConnections[peerIndex]+" has left!", 2000);
		}
	}else{ // when peer transmits their share of chunks to all other peers

		var peerIndex = 0;
		for(peerIndex = 0; peerIndex<peerConnections.length; peerIndex++){
			console.log(peerIndex);
			if(peerConnections[peerIndex] == 0){
				console.log("peer is host");
				peerIndex=(peerIndex+1)%(peerConnections.length); // such that (chunkNum+peerIndex)%(peerConnections.length+1) = 0
			}
			console.log(peerConnections[peerIndex]);
			if (peerConnections[peerIndex]!=0 && peerConnections[peerIndex]!=senderID){ // So that the chunk doesn't go to the host or the sender
				console.log("trying to send chunk");
				try{
					console.log(peerChannel);
					console.log(peerChannel[peerConnections[peerIndex]]);
					console.log(chunk.slice(1,2)[0]);
					peerChannel[peerConnections[peerIndex]].send(chunk);
				}
				catch(e){
					console.log(e);
					Materialize.toast("The peer with ID "+peerConnections[peerIndex]+" has left!", 2000);
				}
			}
		}
	}
	// peerIndex=(chunkNum+peerIndex+1)%(peerConnections.length);
}

// function only used by the host peer
function readyChunk(chunk, updateCount){
		var stream = chunk;
		var bufferCounter = 0; // to add 1 to the chunkNum when the count number reaches 256 in appendCount, we have to leave queue[0] as it is, since it contains user.segmentIndex of fragmeneted video
		var senderID = new Uint8Array(1);
		var chunkNum = new Uint8Array(2);
		var chunkBuffer = new Uint8Array(stream);
		var streamMessage = new Uint8Array(chunkBuffer.byteLength + chunkNum.byteLength + senderID.byteLength);

		senderID[0] = peerIDServer;
		console.log(updateCount);
		chunkNum[0] = updateCount+bufferCounter;
		chunkNum[1] = updateCount+bufferCounter>>8;
		console.log(senderID);

		streamMessage.set(senderID, 0);
		streamMessage.set(chunkNum, 1);
		console.log(streamMessage.slice(1,3)[0])
		streamMessage.set(chunkBuffer, 3);

		if(peerConnections.length>0){
			sendChunk(streamMessage);
		}	
}

// setting up channel to transmit data betweeen the peers
function setupChannel(currentPeer){
	console.log("setup data channel");
	peerChannel[currentPeer].onopen = function(event){
		console.log(currentPeer);
		console.log(peerChannel[currentPeer]);
		// peerConnections.push(currentPeer); // updating the peer list
		console.log(peerConnections);
		console.log(peerNum.innerText);
		var peerNumUpdated = 1+peerConnections.length;
		peerNum.innerHTML = "<b>"+peerNumUpdated.toString()+"</b>";
		console.log(peerNum.innerText);
	};

	peerChannel[currentPeer].onmessage = function (event) {
		console.log("message received");
		if(typeof event.data == "string"){
			var message = JSON.parse(event.data);
			console.log(message);
			// the following callbacks to take care of not retransmitting the playback message again and again by all the peers
			if (message.event == "pause"){
				vid.onpause = function(){};
				vid.pause()
				.then(function(){
					Materialize.toast(message.peerID+" paused the video", 2000)
				})
				.then(function(){
				    addPauseListener();	
				})
			}else{
				vid.onplay = function(){};
				vid.play()
				.then(function(){
					Materialize.toast(message.peerID+" played the video", 2000);
				})
				.then(function(){
				    addPlayListener();
				})
			}
			return;
		}

		var streamReceived = event.data;
		console.log(streamReceived);
		var streamSender = new Uint8Array(streamReceived.slice(0,1))[0];
		console.log(streamSender);
		var chunkNum = new Uint16Array(streamReceived.slice(1,3));
		var chunkBuffer = new Uint8Array(streamReceived.slice(3));
		console.log(chunkBuffer.byteLength);
		console.log(chunkNum);
		var senderID = new Uint8Array(1);
		senderID[0] = peerIDServer;
		console.log(peerIDServer);
		console.log(chunkNum[0]);
		readyChunk(chunkBuffer, chunkNum[0]);
		gotChunk(chunkBuffer ,chunkNum[0]);
		// var newStreamMessage = new Uint8Array(chunkBuffer.byteLength + chunkNum.byteLength + senderID.byteLength);

		// console.log(senderID.byteLength);
		// newStreamMessage.set(senderID);
		// console.log(1);
		// newStreamMessage.set(chunkNum);
		// console.log(2);
		// newStreamMessage.set(chunkBuffer);
		// console.log(3);

		// sendChunk(newStreamMessage);
	}
};

// function to be called when data channel receives the chunk
function gotChunk(chunk, chunkNum){
	queue[chunkNum%maxQueueSize] = chunk;
	if(chunkNum == 0){
		vid.setAttribute("controls", "");
	}
	console.log(chunkNum);
	appendChunk(queue);
}

function appendChunk(queue){
	console.log(chunkToPlay);
	if (queue[chunkToPlay]!=null){
		$("#video-stream").LoadingOverlay("hide", true);
		console.log("trying to play");
			if(!sourceBuffer.updating){
				var chunkAppend = new Uint8Array(queue[chunkToPlay])
				sourceBuffer.appendBuffer(chunkAppend);
				chunkToPlay = (chunkToPlay+1)%maxQueueSize;
				console.log(chunkToPlay);
			}
	}else{
		// Materialize.toast("Buffering! Waiting for chunk to arrive", 1000);
		console.log(queue[chunkToPlay]);
		console.log("%cchunkNum->"+chunkToPlay, "color:#04B431");
		$("#video-stream").LoadingOverlay("show");
		vid.pause();
	}
}

function gotLocalStream(localStream, currentPeer){
	console.log(localStream);
	// Adding the self video element
	var peerMediaElements = document.getElementById("peer-media-banner");
	var peerMediaDiv = document.createElement("div");
	var peerMediaVideo = document.createElement("video");
	peerMediaVideo.setAttribute("class", "z-depth-5");
	peerMediaVideo.autoplay = true;
	peerMediaVideo.setAttribute("height", "150");
	peerMediaVideo.srcObject = localStream;
	window.localStream = localStream
	peerMediaVideo.id = "user-media-"+peerID;
	peerMediaDiv.setAttribute("class", "col s4");
	peerMediaDiv.appendChild(peerMediaVideo); 
	peerMediaElements.appendChild(peerMediaDiv);

	console.log(peerIDList);
	// peerIDList.map(function(currentPeer){
	if(senderID!=peerID){
		window.localStream.getTracks().forEach(
			function(track) {
				console.log("adding stream to "+currentPeer);
				console.log(peerConnection[currentPeer]);
				peerConnection[currentPeer].addTrack(
					track,
					window.localStream
				);
			}
		);
	}

}

// gotRemoteStream called two times on addition of both audio and video tracks
function gotRemoteStream(event){ 
	console.log(event.track.kind);
	if(event.track.kind == "audio"){ // To avoid making two separate elements
		var peerMediaElements = document.getElementById("peer-media-banner");
		var peerMediaDiv = document.createElement("div");
		var peerMediaVideo = document.createElement("video");
		peerMediaVideo.autoplay = true;
		peerMediaVideo.setAttribute("class", "z-depth-5");
		peerMediaVideo.setAttribute("height", "150");
		peerMediaVideo.id = "user-media-"+currentPeer;
		peerMediaDiv.setAttribute("class", "col s4");
		peerMediaDiv.appendChild(peerMediaVideo); 
		peerMediaElements.appendChild(peerMediaDiv);
	}else{
		var peerMediaVideo = document.getElementById("user-media-"+currentPeer);
		peerMediaVideo.srcObject = event.streams[0];
	}
}

function vidPlayBack(event){
	console.log(peerConnections);
	peerConnections.map(function(currentPeer){
		try{
			peerChannel[currentPeer].send(JSON.stringify({"peerID": peerID, "event": event}));
		}
		catch(e){
			console.log("error -> "+e);
		}
	});
}