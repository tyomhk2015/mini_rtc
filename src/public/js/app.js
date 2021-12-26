// FrontEnd(or Browser)

// Connect to a WebSocket

const host = window.location.host; // Get host of the current site.
const socket = new WebSocket(`ws://${host}`); // socket: Represents a connection to the server.
const messageForm = document.querySelector("#messageForm");
const messageInput = document.querySelector("#message");
const nicknameInput = document.querySelector("#nickname");
const messageList = document.querySelector("#messageList");

// When browser is connected to the server.
socket.addEventListener("open", () => {
  console.log("Connected to Server (WS) ✅");
});

// When server sends something to the connected browser.
socket.addEventListener("message", (message) => {
  const messageLine = document.createElement("li");
  messageLine.innerHTML = message.data;
  messageList.append(messageLine);
  console.log("From Server:", message.data);
});

// When disconnected from the server.
socket.addEventListener("close", () => {
  console.log("Disconnected from the server ❌");
});

// Send a message to the server.
messageForm.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const nicknameValue = nicknameInput.value;
  const messageValue =  messageInput.value;
  socket.send(makeMessage(nicknameValue,messageValue));
  messageInput.value = "";
};

// Make an object for sending nickname and message
function makeMessage(nickname, message) {
  const messageObj = {nickname, message};
  return JSON.stringify(messageObj);
};