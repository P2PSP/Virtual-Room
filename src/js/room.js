var vid = document.getElementById("video-stream"); // Video to be streamed
var vidWidth = document.getElementById("video-width");
var vidHeight = document.getElementById("video-height");
var vidFile = document.getElementById("video-file");
var broadcastURL = document.getElementById("broadcast-url");
var baseURL = "http://p2psp.org/virtual-room/room/" // Will be changed accordingly
var peerID = 'xxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // Generating UUID(taking only the first section of the string) according to the RFC4122 version 4(https://www.ietf.org/rfc/rfc4122.txt)
console.log(peerID);

window.onload = function(){
	generateURL();
}

// Filling placeholders after the video has been loaded
// vid.addEventListener("loadedmetadata", function(e){
	// vid.setAttribute("width",vid.videoWidth); // Set the video frame size as per the aspect ratio of the video
	// vidWidth.innerHTML = (vid.videoWidth+"px").bold();
	// vidHeight.innerHTML = (vid.videoHeight+"px").bold();
	// aspectRatio.innerText = vidWidth/vidHeight;

// },false);

// function widthChange(){
//     var widthInput = document.getElementById("width-input");
//     vid.setAttribute("width",widthInput.value);
//     };

// function heightChange(){
//     var heightInput = document.getElementById("height-input");
//     vid.setAttribute("height",heightInput.value);
//     };

vidFile.onchange = function(){
		var streambtn = document.getElementById("stream");
		vid.setAttribute("controls", "")
	    streambtn.setAttribute("class", "btn-flat waves-effect waves-light red");
    };

function streamVideo(){
	// Make a separate function to load the video and call it in the main streamVideo() function
	var source = document.getElementById("video-source");
	var vidURL = URL.createObjectURL(vidFile.files[0]);
	vid.src = vidURL;
	vid.play();
};

function copyBroadcastURL(){
	generateURL();
	var range = document.createRange();
	range.selectNode(broadcastURL)
	console.log(range);
	window.getSelection().removeAllRanges();
	window.getSelection().addRange(range);
	document.execCommand("copy");
	Materialize.toast("Link copied to clipboard", 1000);
};

// Function to be modified to contain logic of generating url
function generateURL(){
	broadcastURL.innerHTML = baseURL+peerID;
}

// disconnect the peer from the room
function disconnectPeer(){

}

// Updating the number of peers and getting stream from the peer on connecting to other peers
function addPeer(){
	var peerNum = document.getElementById("peer-num");
	var peerMediaElements = document.getElementById("peer-media-banner");
	peerNumUpdated = parseInt(peerNum.innerText)+1;
	var peerMediaDiv = document.createElement("div");
	var peerMediaVideo = document.createElement("video");
	peerMediaVideo.setAttribute("class", "z-depth-5")
	var peerMediaSource = document.createElement("source");
	peerMediaVideo.setAttribute("height", "150");
	peerMediaSource.src = "../bbb-cbr-1300-frag.mp4"; // to be updated with UserMedia
	peerMediaSource.id = "user-media-"+peerID;
	peerMediaVideo.appendChild(peerMediaSource);
	peerMediaDiv.setAttribute("class", "col s4");
	peerMediaDiv.appendChild(peerMediaVideo); 
	peerMediaElements.appendChild(peerMediaDiv);
	peerNum.innerText = peerNumUpdated;
}	


