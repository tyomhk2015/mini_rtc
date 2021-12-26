// FrontEnd(or Browser)

// Connect to the server that uses SocketIO.
const socket = io();

// Get DOMs
const welcomeDOM = document.getElementById("welcome");
const welcomeForm = welcomeDOM.querySelector("form");
const roomList = welcomeDOM.querySelector("#roomList");

const room = document.getElementById("room");
const roomForm = room.querySelector("form");
const messageList = room.querySelector("#messageList");
const userCount = room.querySelector("h2");

// Create event handlers
function handleRoomCreation(event) {
  event.preventDefault();
  const roomNameInput = welcomeForm.querySelector("#roomName");
  const nicknameInput = welcomeForm.querySelector("#nickname");
  // emit() Args:
  // 1st: Event name to invoke.
  // 2nd: Data (Obj, Str etc)
  // 3rd: Callback. 
  //      When the action is a success in the server, the server gives the result signal 'done()' to the front end.
  socket.emit("enterRoom", {nickname: nicknameInput.value, room_name: roomNameInput.value}, showRoom);
  roomName = roomNameInput.value;
  roomNameInput.value = "";
}
function handleChatMessage(event) {
  event.preventDefault();
  const chatInput = room.querySelector("#message");
  socket.emit("addMessage", chatInput.value, roomName, () => {
    addMessage(`YOU: ${chatInput.value}`);
    chatInput.value = "";
  });
}

// Listen to events. (Frontend)
welcomeForm.addEventListener("submit", handleRoomCreation);
roomForm.addEventListener("submit", handleChatMessage);

// Listen to events. (From server)
socket.on("welcome", (msg, participants) => {
  // Does not invoke on the same sids at the first time.
  console.log(participants);
  updateUsersCount(participants);
  addMessage(msg);
});
socket.on("addMessage", (msg) => {
  addMessage(msg);
});
socket.on("farewell", (msg, participants) => {
  updateUsersCount(participants);
  addMessage(msg);
});
socket.on("roomUpdate", (rooms) => {
  const subtitle = welcomeDOM.querySelector("h4");
  subtitle.innerText = `Available rooms: ${rooms.length}`;
  roomList.textContent = null;
  rooms.forEach((room) => {
    updateRooms(room);
  });
});

// Custom functions
let roomName; // For showing the name of the room the client is participating.

function showRoom() {
  // Hide welcome div.
  welcomeDOM.removeAttribute("class");
  // Visualize hidden room
  room.classList.add("active");
  const roomH2 = room.querySelector("h2");
  roomH2.innerHTML = roomName.trim().length !== 0 ? `In Room : ${roomName}` : 'In Room'
}

function addMessage(msg) {
  const messageLine = document.createElement("li");
  messageLine.innerText = msg;
  messageList.appendChild(messageLine);
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