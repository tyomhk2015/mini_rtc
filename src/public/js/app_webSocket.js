// FrontEnd(or Browser)

// Connect to a WebSocket

const host = window.location.host; // Get host of the current site.
const socket = new WebSocket(`ws://${host}`); // socket: Represents a connection to the server.
const messageForm = document.querySelector('#messageForm');
const messageInput = document.querySelector('#message');
const nicknameInput = document.querySelector('#nickname');
const messageList = document.querySelector('#messageList');

// When browser is connected to the server.
socket.addEventListener('open', () => {
  console.log('Connected to Server (WS) ✅');
});

// When server sends something to the connected browser.
socket.addEventListener('message', (message) => {
  addMessage(message.data);
});

// When disconnected from the server.
socket.addEventListener('close', () => {
  console.log('Disconnected from the server ❌');
});

// Send a message to the server.
messageForm.addEventListener('submit', handleSubmit);

function handleSubmit(event) {
  event.preventDefault();

  const nicknameValue = nicknameInput.value;
  const messageValue =  messageInput.value;
  const isNicknameEmpty = nicknameValue.trim().length === 0;
  const isMessageEmpty = messageValue.trim().length === 0;

  if ( isNicknameEmpty || isMessageEmpty) {
    isNicknameEmpty ? nicknameInput.value = '' : null;
    isMessageEmpty ? messageInput.value = '' : null;
    return false;
  }

  const message = `(You) ${nicknameValue}: ${messageValue}`;
  addMessage(message);
  colorizeMyMsg();
  socket.send(JSON.stringify({nickname: nicknameValue, message: messageValue}));
  messageInput.value = '';
};

function colorizeMyMsg() {
  messageList.querySelectorAll('li').forEach((list) => {
    if (list.innerText.includes('(You)')) {
      list.classList.add('mine');
    }
  });
}
function addMessage(message) {
  const timeLine = document.createElement('small');
  const date = new Date();
  const hours =  date.getHours();
  const minutes = date.getMinutes();
  timeLine.innerText = `    ${hours < 10 ? `0${hours}` : hours}:${minutes < 10 ? `0${minutes}` : minutes}`;
  
  const messageLine = document.createElement('li');
  messageLine.innerHTML = message;
  messageLine.append(timeLine);
  messageList.insertBefore(messageLine, messageList.firstChild);
}