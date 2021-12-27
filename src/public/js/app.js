// FrontEnd(or Browser)

// Connect to the server that uses SocketIO.
const socket = io();

// Get DOM
const scene = document.getElementById('scene');
const muteBtn = document.getElementById('mute');
const cameraBtn = document.getElementById('camera');
const camerasSelect = document.getElementById('cameras');

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
  }
}

// Event Handlers
muteBtn.addEventListener('click', handleMuteBtn);
cameraBtn.addEventListener('click', handleCameraBtn);
camerasSelect.addEventListener('change', handleCameraChange);

// Custom functions
function handleMuteBtn() {
  stream.getAudioTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  isMute = !isMute;
  muteBtn.innerText  = isMute ? 'Unmute' : 'Mute';
}
function handleCameraBtn() {
  stream.getVideoTracks().forEach((track) => {
    track.enabled = !track.enabled;
  });
  isCameraOff = !isCameraOff;
  cameraBtn.innerText = isCameraOff ? 'Camera On' : 'Camera Off';
}
async function handleCameraChange() {
  await getMedia(camerasSelect.value);
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