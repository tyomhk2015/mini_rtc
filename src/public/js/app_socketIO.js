// FrontEnd(or Browser)

// Connect to the server that uses SocketIO.
const socket = io();

// Get DOMs
const welcomeDOM = document.getElementById("welcome");
const welcomeForm = welcomeDOM.querySelector("form");
const roomList = welcomeDOM.querySelector("#roomList");
const roomNameInput = welcomeForm.querySelector("#roomName");
const topPageNickname = welcomeForm.querySelector("#topNickname");
const createBtn = welcomeForm.querySelector(".create");
const joinBtn = welcomeForm.querySelector(".join");

const room = document.getElementById("room");
const roomForm = room.querySelector("form");
const messageList = room.querySelector("#messageList");
const roomPageNicknameInput = room.querySelector('#roomNickname');
const chatInput = room.querySelector("#message");
const userCount = room.querySelector("h2");
const leaveBtn = room.querySelector(".leave");

const nicknameInputs = [topPageNickname, roomPageNicknameInput];

// Create event handlers
function handleRoomCreation() {
  const validatePassed = validateForm('welcome');
  if(!validatePassed) return false;

  socket.emit("createRoom", {nickname: topPageNickname.value, room_name: roomNameInput.value}, showRoom);
  roomName = roomNameInput.value;
}
function handleRoomJoin() {
  const validatePassed = validateForm('welcome');
  if(!validatePassed) return false;

  socket.emit("joinRoom", {nickname: topPageNickname.value, room_name: roomNameInput.value}, showRoom);
  roomName = roomNameInput.value;
}
function handleChatMessage(event) {
  event.preventDefault();
  const validatePassed = validateForm('room');
  if(!validatePassed) return false;

  const payload = {nickname: roomPageNicknameInput.value, message: chatInput.value}
  const writtenByMe = true;
  socket.emit("addMessage", payload, roomName, () => {
    addMessage(payload, writtenByMe);
    chatInput.value = "";
  });
}
function syncNickname(event) {
  const updatedNickname = event.target.value;
  nicknameInputs.forEach((el) => {
    el.value = updatedNickname;
    nickname = updatedNickname;
  })
}
function leaveRoom() {
    // Visualize hidden room
    room.removeAttribute("class");

    // Show welcome div.
    welcomeDOM.classList.add("active");

    const roomH2 = room.querySelector("h2");
    roomH2.innerHTML = 'In Room';
    messageList.textContent = null;
    socket.emit("leave", roomName, nickname);
}

// Listen to events. (Frontend)
createBtn.addEventListener("click", handleRoomCreation);
joinBtn.addEventListener("click", handleRoomJoin);
roomForm.addEventListener("submit", handleChatMessage);
nicknameInputs.forEach((el) => {
  el.addEventListener("input", syncNickname);
});
leaveBtn.addEventListener("click", leaveRoom);

// Listen to events. (From server)
socket.on("welcome", (payload, participants) => {
  // Does not invoke on the same sids at the first time.
  updateUsersCount(participants);
  echoJoinMsg(payload.message);
});
socket.on("addMessage", (payload) => {
  addMessage(payload);
});
socket.on("farewell", (payload, participants) => {
  updateUsersCount(participants);
  echoJoinMsg(payload.message);
});
socket.on("roomUpdate", (rooms) => {
  const subtitle = welcomeDOM.querySelector("h4");
  subtitle.innerText = `Available rooms: ${rooms.length}`;
  roomList.textContent = null;
  rooms.forEach((room) => {
    updateRooms(room);
  });
});
socket.on("roomNotFound", (roomName) => {
  const errorMsg = `${roomName} does not exist.`;
  showErrorMsg(errorMsg);
});
socket.on("roomExist", (roomName) => {
  const errorMsg = `The room name, ${roomName}, already exists.`;
  showErrorMsg(errorMsg);
});

// Custom functions
let roomName;
let nickname;

function showRoom() {
  // Hide welcome div.
  welcomeDOM.removeAttribute("class");
  roomNameInput.value = "";
  const errorMsgDOM = welcomeDOM.querySelector('.notFound');
  if(errorMsgDOM) {
    errorMsgDOM.remove();
  }
  // Visualize hidden room
  room.classList.add("active");
  const roomH2 = room.querySelector("h2");
  roomH2.innerHTML = roomName.trim().length !== 0 ? `In Room : ${roomName}` : 'In Room'
  
}

function addMessage(payload, writtenByMe) {
  const timeStampDOM = createTimestamp();
  const messageLine = document.createElement("li");
  let msg = `${payload.nickname}: ${payload.message}`;
  if(writtenByMe){
    msg = `(You)`.concat(' ', msg);
    messageLine.classList.add("mine");
  }
  messageLine.innerText = msg;
  messageLine.append(timeStampDOM);
  messageList.appendChild(messageLine);
}

function echoJoinMsg(msg) {
  const timeStampDOM = createTimestamp();
  const messageLine = document.createElement("li");
  messageLine.innerText = msg;
  messageLine.append(timeStampDOM);
  messageList.appendChild(messageLine);
}

function createTimestamp() {
  const timeLine = document.createElement('small');
  const date = new Date();
  const hours =  date.getHours();
  const minutes = date.getMinutes();
  timeLine.innerText = `    ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  return timeLine;
}

function updateRooms(room) {
  const roomLine = document.createElement("li");
  roomLine.innerText = room;
  roomList.appendChild(roomLine);
}

function updateUsersCount(participants) {
  console.log(participants);
  userCount.innerHTML = `In Room : ${roomName} (${participants})`;
}

function showErrorMsg(message) {
  const errorMsgDOM = welcomeDOM.querySelector('.notFound');
  if(errorMsgDOM) {
    errorMsgDOM.remove();
  };
  const errorMsg = document.createElement("h4");
  errorMsg.innerText = message;
  errorMsg.classList.add('notFound');

  const btnWrapper = document.querySelector('.btnWrapper');
  btnWrapper.before(errorMsg);
}

function validateForm(type) {
  let validationPassed = true;
  switch(type){
    case 'welcome':
      const isTopNicknameEmpty = topPageNickname.value.trim().length === 0;
      const isRoomNameEmpty = roomNameInput.value.trim().length === 0;
      if ( isTopNicknameEmpty || isRoomNameEmpty) {
        const topErrMsg = 'Please fill in nickname & room name.';
        showErrorMsg(topErrMsg);
        validationPassed = false;
      }
      break;
    case 'room':
      const isRoomNicknameEmpty = roomPageNicknameInput.value.trim().length === 0;
      const isChatEmpty = chatInput.value.trim().length === 0;
      if ( isRoomNicknameEmpty || isChatEmpty) {
        const roomErrMsg = 'Please fill in nickname & chat message.';
        showErrorMsg(roomErrMsg);
        validationPassed = false;
      }
      break;
    default:
      break;
  }
  return validationPassed;
}