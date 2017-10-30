
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


    navigator.getUserMedia({
      video:true ,
      audio:false
    },function(stream){
        var videoWebCam = document.getElementById('videoWebCam');
        videoWebCam.src = window.URL.createObjectURL(stream);
        videoWebCam.play();
    },function(error){
    });

  function subirArchivo(){
    //var input =  document.getElementById('archivoSubido');
    var vid = document.getElementById('miVideo');
    var trackk = document.getElementById('sub');
    trackk.src = window.URL.createObjectURL(archivoSubido.files[0]);
    vid.play();
  }





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
  function handleLocalAddCandidateSuccess() {
    connectButton.disabled = true;
  }

  function handleRemoteAddCandidateSuccess() {
    disconnectButton.disabled = false;
  }

  function receiveChannelCallback(event) {
    receiveChannel = event.channel;
    receiveChannel.onmessage = handleReceiveMessage;
    receiveChannel.onopen = handleReceiveChannelStatusChange;
    receiveChannel.onclose = handleReceiveChannelStatusChange;
  }


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

  function handleReceiveChannelStatusChange(event) {
    if (receiveChannel) {
      console.log("Receive channel's status has changed to " +
                  receiveChannel.readyState);
    }
  }

  function sendMessage() {
    var reader = new window.FileReader();
    reader.readAsDataURL(archivoSubido.files[0]);
    console.log(reader);
    reader.onload = console.log("Hello World");
    console.log(reader);
    reader.onload=onReadAsDataURL();
  }

  function onReadAsDataURL(event, text) {
    /*
    var data = {}; // data object to transmit over data channel

    if (event) text = event.target.result; // on first invocation

    if (text.length > chunkLength) {
        data.message = text.slice(0, chunkLength); // getting chunk using predefined chunk length
    } else {
        data.message = text;
        data.last = true;
    }

    sendChannel.send(JSON.stringify(data)); // use JSON.stringify for chrome!
    console.log("Archivo enviado");
    var remainingDataURL = text.slice(data.message.length);
    if (remainingDataURL.length) setTimeout(function () {
        onReadAsDataURL(null, remainingDataURL); // continue transmitting
    }, 500);
    */
    //if(event)
    console.log(event);
    console.log(text);
      text1=event.target.result;
      console.log(text1);
      sendChannel.send(JSON.stringify(text1));
}


  function handleReceiveMessage(event) {
    console.log("Recibido");
    /*
    var arrayToStoreChunks = [];
    arrayToStoreChunks.push(JSON.parse(event.data).message);
    archSubtitulo=arrayToStoreChunks.join('');
    */
    var blob=dataURItoBlob(JSON.parse(event.data));

    var vid = document.getElementById('miVideo');
    var trackk = document.getElementById('sub');
    trackk.src = window.URL.createObjectURL(blob);
    vid.play();
  }

  function dataURItoBlob(dataURI) {
      // convert base64/URLEncoded data component to raw binary data held in a string
      var byteString;
      if (dataURI.split(',')[0].indexOf('base64') >= 0)
          byteString = atob(dataURI.split(',')[1]);
      else
          byteString = unescape(dataURI.split(',')[1]);
      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to a typed array
      var ia = new Uint8Array(byteString.length);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }

      return new Blob([ia], {type:mimeString});
  }

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
