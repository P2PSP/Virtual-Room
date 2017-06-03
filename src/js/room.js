var vid = document.getElementById("video-stream"); // Video to be streamed
var widthInput = document.getElementById("width-input");
var heightInput = document.getElementById("height-input");
var vidFile = document.getElementById("video-file");
var broadcastURL = document.getElementById("broadcast-url");

// Filling placeholders after the video has been loaded
vid.addEventListener("loadedmetadata", function(e){
	vid.setAttribute("width",vid.videoWidth); // Set the video frame size as per the aspect ratio of the video
	widthInput.setAttribute("placeholder", vid.videoWidth+"px");
	heightInput.setAttribute("placeholder", vid.videoHeight+"px");
},false);

function widthChange(){
    var widthInput = document.getElementById("width-input");
    vid.setAttribute("width",widthInput.value);
    };

function heightChange(){
    var heightInput = document.getElementById("height-input");
    vid.setAttribute("height",heightInput.value);
    };

vidFile.onchange = function(){
		var streambtn = document.getElementById("stream");
	    streambtn.setAttribute("class", "btn-flat waves-effect waves-light red");
    };

function streamVideo(){
	// Make a separate function to load the video and call it in the main streaVideo() function
	console.log(vidFile.value);
	var source = document.getElementById("video-source");
	var vidURL = URL.createObjectURL(vidFile.files[0]);
	vid.src = vidURL;
	vid.play();
};

function copyBroadcastURL(){
	generateURL();
	var range = document.createRange();
	range.selectNode(broadcastURL)
	window.getSelection().addRange(range);
	document.execCommand("copy");
};

// Function to be modified to contain logic of generating url
function generateURL(){
	broadcastURL.innerText = "http://p2psp.org";
}