// FrontEnd(or Browser)

// Connect to a WebSocket

const host = window.location.host; // Get host of the current site.
const socket = new WebSocket(`ws://${host}`); // socket: Represents a connection to the server.
const messageform = document.querySelector("form");
const messageList = document.querySelector("ul");

// When browser is connected to the server.
socket.addEventListener("open", () => {
  console.log("Connected to Server (WS) ✅");
});

// When server sends something to the connected browser.
socket.addEventListener("message", (message) => {
  console.log("From Server:", message.data);
});

// When disconnected from the server.
socket.addEventListener("close", () => {
  console.log("Disconnected from the server ❌");
});

// Send a message to the server.
messageform.addEventListener("submit", handleSubmit);

function handleSubmit(event) {
  event.preventDefault();
  const input = messageform.querySelector("input");
  socket.send(input.value);
  input.value = "";
};