var vid = document.getElementById("video-stream"); // Video to be streamed
var widthInput = document.getElementById("width-input");
var heightInput = document.getElementById("height-input");
var vidFile = document.getElementById("video-file");

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
	console.log(vidFile.value);
	var source = document.getElementById("video-source");
	var vidURL = URL.createObjectURL(vidFile.files[0]);
	vid.src = vidURL;
	vid.play();
}