var vid = document.getElementById("video-stream"); // Video to be streamed
var vidHeight = vid.getAttribute("height");
var vidWidth = vid.getAttribute("width");
var vidFile = document.getElementById("video-file");
var broadcastURL = document.getElementById("broadcast-url");
var baseURL = "http://p2psp.org/virtual-room/room/" // Will be changed accordingly
var peerID = 'xxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);}); // Generating UUID(taking only the first section of the string) according to the RFC4122 version 4(https://www.ietf.org/rfc/rfc4122.txt)
var vidToWindowRatio;
var aspectRatio;
var videoLoaded;

window.onload = function(){
	generateURL();
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
	//else{
	// 	console.log(screen.width);
	// 	// var vidToWindowRatio = (vidHeight/screen.height).toFixed(3);
	// 	// var aspectRatio = vidHeight/vidWidth;
	// 	// var newWidth = vidToWindowRatio*window.outerHeight*aspectRatio;
	// 	// console.log(vidToWindowRatio);
	// 	// console.log(newWidth);
	// 	// widthChange(newWidth);
	// }
}

vidFile.onchange = function(){
		var streambtn = document.getElementById("stream");
		vid.setAttribute("controls", "")
	    streambtn.setAttribute("class", "btn-flat waves-effect waves-light red");
    };

function streamVideo(){
	// Make a separate function to load the video and call it in the main streamVideo() function
	// var source = document.getElementById("video-source");
	// var vidURL = URL.createObjectURL(vidFile.files[0]);
	// vid.src = vidURL;
	// vid.play();
	fragmentMP4();
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

function fragmentMP4(){
	// var video = document.getElementById('video-stream');
	// var assetURL = "../AIB  - Man's Best Friend-93oxfr6KfpA.mp4";
// Need to be specific for Blink regarding codecs
var mimeCodec = 'video/mp4; codecs="avc1.4d0020"';
if ('MediaSource' in window && MediaSource.isTypeSupported(mimeCodec)) {
    var mediaSource = new MediaSource;
    //create an URL (from mediaSource OBJ) as video's source
    vid.src = URL.createObjectURL(mediaSource);
    mediaSource.addEventListener('sourceopen', on_source_open);
} else {
    console.error('Unsupported MIME type or codec: ', mimeCodec);
}

function on_source_open(_) {
    console.log("open");
    var mediaSource = this;
    var sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
    sourceBuffer.segmentIndex = 0;
    sourceBuffer.AppendMode = "sequence";
    sourceBuffer.mode = "sequence";
    var outBuffer = new Array(); 
    var videoFile = vidFile.files[0];
    var fileRead = new FileReader;
    fileRead.readAsArrayBuffer(videoFile);
    fileRead.onloadend = function (evt) {

        // console.log("2.on response"); 
        var mp4box = new MP4Box();
        var initializeSegments ;  
        var updateCount = 0;
        sourceBuffer.addEventListener('updateend', function (_) {
            if(updateCount < initializeSegments[0].user.segmentIndex)
            {
                // console.log("8.append_cnt:"+updateCount);
                console.log(outBuffer[updateCount]);
                sourceBuffer.appendBuffer(outBuffer[updateCount]); 
                updateCount++;
            }
            else 
            {
                // console.log("9.start play");
                vid.play();
            }
        });
        mp4box.onMoovStart = function () {
            console.log("4.Starting to receive File Information");
        }
        mp4box.onReady = function(info) {
            // console.log("5.info.mime:"+info.mime);
            mp4box.onSegment = function (id, user, buffer, sampleNum) {
                console.log("Received segment on track "+id+" for object "+user+" with a length of "+buffer.byteLength+",sampleNum="+sampleNum);
                console.log("user.segmentIndex:"+user.segmentIndex);
                outBuffer[user.segmentIndex] = buffer.slice(0) ;
                //user.appendBuffer(outBuffer[user.segmentIndex]); 
                user.segmentIndex++;
            }; 
            var options = { nbSamples: 200 };
            mp4box.setSegmentOptions(info.tracks[0].id, sourceBuffer, options);  
            initializeSegments = mp4box.initializeSegmentation();  
            console.log("starting");
            mp4box.start();
            console.log("start->stop");
            mp4box.flush();
            // console.log("6.mp4 processing end"); 
        };

        var ab = evt.target.result;
        console.log(ab);
        ab.fileStart = 0;
        // console.log("3.mp4 appendBuffer start,start point:"+nextBufferStart); 
        var nextBufferStart = mp4box.appendBuffer(ab);
            
        // console.log("7.source buffer appendBuffer start:"); 
        console.log(initializeSegments[0].buffer);
        sourceBuffer.appendBuffer(initializeSegments[0].buffer); 
    };
    // console.log("1.on send"); 
};
}

function widthChange(width){
    vid.setAttribute("width",width);
};
