// FrontEnd(or Browser)

// Connect to a WebSocket

const host = window.location.host; // Get host of the current site.
const socket = new WebSocket(`ws://${host}`); // socket: Represents a connection to the server.

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
setTimeout(() => {
  socket.send("狂気のにじさんじ！");
}, 2000);