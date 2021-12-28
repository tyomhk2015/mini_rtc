// FrontEnd(or Browser)

// Connect to the server that uses SocketIO.
const socket = io();

// Get DOM
const scene = document.getElementById('scene');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');
const welcome = document.getElementById('welcome');
const welcomeForm = welcome.querySelector('form');
const streamWrapper = document.getElementById('streamWrapper');
const peerStream = document.getElementById('peerStream');


scene.volume = 0.2;


// Get Media Devices (Camera, Audio)
let stream;
let isMute = false;
let isCameraOff = false;
async function getMedia(deviceId){
  try {
    // Arg. of getUserMedia() : Types of streams you want to get, specify as an object.
    stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: deviceId ? {deviceId: {exact: deviceId}} : {facingMode: "user"},
    });
    scene.srcObject = stream;
    if (!deviceId) await getCameras();
  } catch (error) {
    console.log(error);
    document.getElementById('error').textContent = 'Your browser / device does not support navigator.mediaDevices.';
  }
}

// Variables related to rooms.
let roomName;

// Variable related to P2P
let myPeerConnection;

// Event Handlers
muteBtn.addEventListener('click', handleMuteBtn);
cameraBtn.addEventListener('click', handleCameraBtn);
camerasSelect.addEventListener('change', handleCameraChange);
welcomeForm.addEventListener('submit', switchContent);

// Handle events from the server.
// The logic for Peer A, the creator of the room, or the old members dwelling in the room.
socket.on("greeting", async (msg) => {
  console.log(msg);
  const offer = await myPeerConnection.createOffer(); // https://huchu.link/1vcRLgS
  myPeerConnection.setLocalDescription(offer); // https://huchu.link/ryOuwR4
  console.log("🏠 Peer A: The offer has been sent to the server.");
  socket.emit("offer", offer, roomName);
});
socket.on("answer", (answer) => {
  console.log("🏠 Peer A: Got the answer from the server.");
  myPeerConnection.setRemoteDescription(answer);
});
// The logic for Peer B, the new participant of the room.
socket.on("offer", async (offer) => {
  console.log("🙋‍♂️🙋‍♀️ Peer B: Got the offer from the server.");
  myPeerConnection.setRemoteDescription(offer); // https://huchu.link/uIobtS0
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  console.log("🙋‍♂️🙋‍♀️ Peer B: Sent answer to the server.");
  socket.emit("answer", answer, roomName);
});
// The logic for peer A, initially.
// The logic is for Peer A and Peer B
socket.on("ice", (icecandidate) => {
  console.log('Received icecandidate from the server.');
  myPeerConnection.addIceCandidate(icecandidate); // https://huchu.link/5vJyTCU
});

// Custom functions
function handleMuteBtn() {
  isMute = !isMute;
  toggleMic();
  muteBtn.innerText  = isMute ? 'Unmute' : 'Mute';
}

function handleCameraBtn() {
  isCameraOff = !isCameraOff;
  toggleCamera();
  cameraBtn.innerText = isCameraOff ? 'Camera On' : 'Camera Off';
}

async function handleCameraChange() {
  await getMedia(camerasSelect.value);

  if(myPeerConnection) {
    // When my camera changes, send my updated video track to my peers.
    const myVideoTrack = stream.getVideoTracks()[0];
    const videoSender = myPeerConnection.getSenders().find((sender) => sender.track.kind === 'video');
    videoSender.replaceTrack(myVideoTrack);
  }

  // Sync mic mute & camera on setting.
  toggleMic(); 
  toggleCamera(); 
}

function toggleMic() {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = !isMute;
  });
}

function toggleCamera() {
  stream.getVideoTracks().forEach((track) => {
    track.enabled = !isCameraOff;
  });
}

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === 'videoinput');
    const currentCamera = stream.getVideoTracks(); // For selecting the camera currently used at initial stage.
    // Dynamically create camera options.
    cameras.forEach((camera) => {
      const option = document.createElement('option');
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.append(option);
    });
  } catch (error) {
    console.log(error);
  }
}

async function switchContent(event) {
  event.preventDefault();
  const roomInput = welcome.querySelector('#roomInput');
  if(roomInput.value.trim().length === 0) return;

  roomName = roomInput.value;
  await initiateStream();
  // Peer A & Peer B
  socket.emit("enterRoom", roomName);
  welcome.removeAttribute('class');
  streamWrapper.classList.add('active');
}

function setTitle() {
  const h3 = streamWrapper.querySelector('h3');
  h3.innerText = `Room: ${roomName}`;
}

async function initiateStream() {
  setTitle();
  await getMedia();
  makeConnection(); // RTC code.
}

// RTC Connection.
function makeConnection() {
  // Make P2P Connection (Peer A and Peer B)
  myPeerConnection = new RTCPeerConnection(); // https://huchu.link/3AChPBY
  myPeerConnection.addEventListener('icecandidate', handleICE);
  myPeerConnection.addEventListener('track', handleAddStream);
  stream.getTracks().forEach((track) => {
    myPeerConnection.addTrack(track, stream); // https://huchu.link/r3S7Wcd
  });
}

function handleICE(data) {
  // ICEcandidate is invoked whenever there is communication between peers.
  console.log('Sent candidate to the server.');
  socket.emit('ice', data.candidate, roomName);
}

function handleAddStream(data) {
  // Attach peer B's stream to the video tag
  peerStream.srcObject = data.streams[0]; // https://huchu.link/CYisHDJ
}