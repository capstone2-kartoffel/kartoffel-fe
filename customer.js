const loggedInEmail = localStorage.getItem('loggedInEmail');
console.log(loggedInEmail);

if (loggedInEmail == 'None') {
}

// Function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Generate room ID
const room = generateUUID();

// Socket.io connection
const socket = io('http://spacechat.co.kr:60000');

// Send room ID to the server
socket.emit('room_id', room);

socket.on('connect', function() {
    socket.emit('join', {username: 'Customer', room: room});
});

socket.on('message', function(data) {
    const messages = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.innerText = data.message;
    messageElement.classList.add(data.sender !== 'Manager' ? 'sent' : 'received');
    messages.appendChild(messageElement);
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim(); // Remove whitespace
    if (message) {
        socket.emit('message', {room: room, message: message, sender: loggedInEmail});
        messageInput.value = '';
    }
}

document.getElementById('messageInput').addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage();
    }
});
