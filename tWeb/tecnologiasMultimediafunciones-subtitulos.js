var contador=0;
var textLength=null;
var bytes = null;
var arrayBuffer = null;
var archSubtitulo = null;
var chunkLength=1000;

  function parar(){
    var video = document.getElementById('miVideo')
    video.pause();
  }

  function pararCamara(){
    var video = document.getElementById('video')
    video.pause();
  }

/*
  navigator.getUserMedia({
      video:true ,
      audio:false
    },function(stream){
        var videoWebCam = document.getElementById('videoWebCam');
        videoWebCam.src = window.URL.createObjectURL(stream);
        videoWebCam.play();
    },function(error){
    });
*/

  function subirArchivoLocal(){
    //var input =  document.getElementById('archivoSubido');
    var vid = document.getElementById('miVideo');
    var trackk = document.getElementById('sub');
    trackk.src = window.URL.createObjectURL(archivoSubido.files[0]);
    vid.play();
  }




//
  function startup() {
    connectButton = document.getElementById('connectButton');
    disconnectButton = document.getElementById('disconnectButton');
    sendButton = document.getElementById('sendButton');
    messageInputBox = document.getElementById('message');
    receiveBox = document.getElementById('receivebox');

    // Set event listeners for user interface widgets

    connectButton.addEventListener('click', connectPeers, false);
    disconnectButton.addEventListener('click', disconnectPeers, false);
    sendButton.addEventListener('click', sendMessage, false);
  }
  //
  function connectPeers(){
    localConnection = new RTCPeerConnection();

    sendChannel = localConnection.createDataChannel("sendChannel");
    sendChannel.onopen = handleSendChannelStatusChange;
    sendChannel.onclose = handleSendChannelStatusChange;

    remoteConnection = new RTCPeerConnection();
    remoteConnection.ondatachannel = receiveChannelCallback;

    localConnection.onicecandidate = e => !e.candidate
        || remoteConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);

    remoteConnection.onicecandidate = e => !e.candidate
        || localConnection.addIceCandidate(e.candidate)
        .catch(handleAddCandidateError);


        localConnection.createOffer()
        .then(offer => localConnection.setLocalDescription(offer))
        .then(() => remoteConnection.setRemoteDescription(localConnection.localDescription))
        .then(() => remoteConnection.createAnswer())
        .then(answer => remoteConnection.setLocalDescription(answer))
        .then(() => localConnection.setRemoteDescription(remoteConnection.localDescription))
        .catch(handleCreateDescriptionError);

  }
  //
  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }
//
  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }
//
  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }

//
  function handleSendChannelStatusChange(event) {
    if (sendChannel) {
      var state = sendChannel.readyState;

      if (state === "open") {
        messageInputBox.disabled = false;
        messageInputBox.focus();
        sendButton.disabled = false;
        disconnectButton.disabled = false;
        connectButton.disabled = true;
      } else {
        messageInputBox.disabled = true;
        sendButton.disabled = true;
        connectButton.disabled = false;
        disconnectButton.disabled = true;
      }
    }
  }
//
  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }
  }

  function sendMessage() {
    var reader = new window.FileReader();
    reader.readAsText(archivoSubido.files[0]);
    console.log(reader);
    reader.onload=onReadSubtitles;
  }

  function onReadSubtitles(event, text) {
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation
    if(contador==0){
      textLength=text.length;
      contador=1;
    }

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }
    console.log(data);
    console.log(data.message);
    sendChannel.send(JSON.stringify(data)); // use JSON.stringify for chrome!
    console.log("Archivo enviado");
    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 500);
    /*
    if(event){
      text1=event.target.result;
      console.log(text1);
      sendChannel.send(JSON.stringify(text1));
    }
    */
}
//aitana amaia alfred seguro que no.
//
  function handleReceiveMessage(event) {
    console.log("Recibido");
    var arrayToStoreChunks = [];
    console.log(JSON.parse(event.data).message);
    arrayToStoreChunks.push(JSON.parse(event.data).message);
    if(contador==1){
      archSubtitulo=arrayToStoreChunks.join('');
      contador=2;
    }else{
      archSubtitulo+=arrayToStoreChunks.join('');
    }
    console.log(archSubtitulo);
    if(archSubtitulo.length==textLength){
      console.log("Creando blob");
      var blob=new Blob([archSubtitulo],{type: "text/vtt"});
      console.log(blob);
      var vid = document.getElementById('miVideo');
      var trackk = document.getElementById('sub');
      trackk.src = window.URL.createObjectURL(blob);
      console.log(trackk.src);
      vid.play();
  }
  }
//
  function disconnectPeers() {

    // Close the RTCDataChannels if they're open.

    sendChannel.close();
    receiveChannel.close();

    // Close the RTCPeerConnections

    localConnection.close();
    remoteConnection.close();

    sendChannel = null;
    receiveChannel = null;
    localConnection = null;
    remoteConnection = null;

    // Update user interface elements

    connectButton.disabled = false;
    disconnectButton.disabled = true;
    sendButton.disabled = true;

    messageInputBox.value = "";
    messageInputBox.disabled = true;
  }
