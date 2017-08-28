# Virtual Rooom *0.1.0*

### src/room.js


#### addPauseListener() 

Adds the pause Listener to the stream. Used in Synchronized playback, enabling pause event to work smooth






##### Returns


- `Void`



#### addPlayListener() 

Adds the play Listener to the stream and deletes all previous `paused` toasts. Used in Synchronized playback, enabling play event to work smooth






##### Returns


- `Void`



#### connectSignalServer()

Adds/verifies the current room of the peer on signalling server. Adds the current peer to the room if the room is added/verified





##### Returns


- `Void`



#### handleMessage()

To handle and direct the messages received from the server other than messages related to connection of peers





##### Returns


- `Void`



#### copyBroadcastURL()

Selects the range of the Room URL and copies it to the clipboard





##### Returns

- `Void`



#### generateURL()

Logic for generating URL, sets the Room URL text to the new URL






##### Returns

- `Void`



#### fragmentMP4()

Pre Initiation for fragmenting of MP4 video, adds the event Listener to set mimeCodec of MediaSource and calls the onFragment() function





##### Returns

- `Void`



#### setSourceBuffer()

Configures the media Source, adds source buffer according to the video's codecs. Sets the segmentIndex, AppendMode and simple mode





##### Returns

- `Void`



#### onFragment()

Initializes the file reader(reads the video file), initializes MP4Box and segmentation of the video. Reads the video file information and accordingly changes `nbSamples`, `numChunks`, `mimeCodec` and more. Also tells if the codec is supported or not. Finally fragments the video into small chunks and sends them to append in media source and to other peers




##### Returns

- `Void`



#### preInititiation()

Initializes connection with the signalling Server and adds User media to local window stream. Sets currentPeer





##### Returns

- `Void`



#### fallbackUserMedia()

Callback for failure of `getUserMedia`. Replaces the empty video element with a default avatar





##### Returns

- `Void`



#### initiatePeerConnection(currentPeer, callback)

Initiates the `RTCPeerConnection` and negotiation with other peers. Calls createDataChannel() to initiate data channel connection



##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| currentPeer | `Integer`  | - Server ID of the peer for peer Connection |
| callback    | `Function`  | - To initialize data Channel |





##### Returns

- `Void`



#### sendOffer()

Sends the offer to other peers on negotiation





##### Returns

- `Void`



#### createLocalDescription(answer)

Sets the localDescription and sends the offer to the `currentPeer`



##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| answer | `Object`  | - Answer from `currentPeer` |





##### Returns

- `Void`


#### gotMessageFromServer(message)

Used to handle all the messages from peers regarding peer connections, data channel and video conference handling



##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| messages | `Object`  | - Message received from signalling Server |





##### Returns

- `Void`




#### cleanBuffer(chunkStart, chunkEnd)

Used to delete saved buffer from the browser and clean up `sourceBuffer`



##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| chunkStart | `Object`  | - start time of the chunk to be cleaned |
| chunkEnd | `Object`  | - end time of the chunk to be cleaned |





##### Returns

- `Void`




#### createDataChannel(currentPeer, callback)

Used to create data channel with `currentPeer`





##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| currentPeer | `Integer`  | - current peer in peerConnections |
| callback | `function`  | - to set up channel |





##### Returns

- `Void`



#### sendChunk(chunk)

Sends the chunk to the appropriate peer using round robin method





##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| chunk | `Object`  | - fragmented chunk to be sent |





##### Returns

- `Void`


#### readyChunk(chunk, updateCount)

Handles and sets different properties of the chunk such as `senderID`, `chunkNum` before sending it to other peers





##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| chunk | `Object`  | - fragmented raw chunk to be sent |
| updateCount| `Object` | - Chunk number |





##### Returns

- `Void`


#### setupChannel(currentPeer)

Sets up the data channel established between two peers and updates the peerConnections list. Added event listener for `onmessage` to handle all the messages received on the data channel




##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| currentPeer | `Integer`  | - Server ID of the other peer in data channel  |





##### Returns

- `Void`

#### gotChunk(chunk, chunkNum)

Appends the current chunk to queue on receiving a new chunk




##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| chunk | `Object`  | - fragmented chunk to be sent  |
| chunkNum | `Integer`  | - Chunk Number  |





##### Returns

- `Void`


#### appendChunk(queue)

Checks if the next chunk to be played exists in the queue and appends that chunk in the queue to Media Source




##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| queue | `Array`  | - Array containing the chunks appropriately in its indices according to chunkNum  |





##### Returns

- `Void`


#### gotLocalStream(localStream, currentPeer)

Appends the self webcam stream in the room by making the self element and adding track in `window.localStream`


##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| localStream | `Object`  | - Media Stream captured by `getUserMedia()`  |
| currentPeer | `Integer`  | - Server ID of the peer for peer Connection |


##### Returns

- `Void`


#### gotRemoteStream(event)

Appends the webcam stream of the new peer in the room to every peer's page and makes a new video element


##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| event | `Object`  | - Event on receiving remote stream by peer.  |


##### Returns

- `Void`


#### vidPlayBack(event)

Hanldles the sychronized playback by sending message over data channel to every peer on a play/pause event


##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| event | `String`  | - Play/Pause event string on respective event trigger  |


##### Returns

- `Void`



#### setAlias()

Sets the alias of a peer and sends the new alias list to all the peers

##### Returns

- `Void`


#### sendBurstMode(chunk, updateCount)

Sends the chunk to all peers in burst mode, if the next chunk(sent by host peer) has to be added in the queue and lastChunk sent is not sent to all the peers or `peerPending!=null` by round robin scheduling


##### Parameters

| Name        | Type | Description |
| ------------| ---- | ----------- |
| chunk | `Object`  | - last chunk received by the peer from host peer  |
| updateCount | `Integer`  | - chunk Number |



##### Returns

- `Void`



#### stopWebCam()

Stops the webcam and replaces the video element with a default avatar. Rather than deleting the video element node replace the child node with `img` element


##### Returns

- `Void`


#### stopAudio()

Stops the audio input from peer's microphone