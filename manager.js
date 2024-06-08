const socket = io('http://spacechat.co.kr:60000?role=manager');
let currentRoom = '';
let deleteMode = false;

function joinRoom(room) {
    if (currentRoom) {
        socket.emit('leave', { username: 'Manager', room: currentRoom });
    }
    currentRoom = room;
    socket.emit('join', { username: 'Manager', room: currentRoom });
    document.getElementById('messages').innerHTML = '';
    document.getElementById('chatSidebar').style.display = 'none';
    document.getElementById('chatMain').style.display = 'flex';
    document.getElementById('chatHeader').innerText = `Chat with Customer in Room ${room}`;
}

function goBack() {
    document.getElementById('chatSidebar').style.display = 'block';
    document.getElementById('chatMain').style.display = 'none';
    if (currentRoom) {
        socket.emit('leave', { username: 'Manager', room: currentRoom });
        currentRoom = '';
    }
}

function toggleDeleteMode() {
    deleteMode = !deleteMode;
    const deleteButton = document.getElementById('deleteButton');
    const confirmButton = document.getElementById('confirmButton');
    if (deleteMode) {
        deleteButton.style.display = 'none';
        confirmButton.style.display = 'inline';
        showCheckboxes();
    } else {
        deleteButton.style.display = 'inline';
        confirmButton.style.display = 'none';
        hideCheckboxes();
    }
}

function showCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.style.display = 'inline';
    });
}

function hideCheckboxes() {
    const checkboxes = document.querySelectorAll('.checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.style.display = 'none';
    });
}

function deleteSelectedRooms() {
    const selectedRooms = document.querySelectorAll('input[type="checkbox"]:checked');
    selectedRooms.forEach(room => {
        const roomId = room.value;
        socket.emit('delete_room', { room_id: roomId });
    });
    toggleDeleteMode();
}

socket.on('connect', function() {
    socket.emit('get_rooms');

    socket.on('rooms_list', function(data) {
        const chatRooms = document.getElementById('chatRooms');
        chatRooms.innerHTML = '';
        data.rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room');
            
            // Guest 전용 채팅방인 경우 삭제 체크박스를 표시하지 않음
            if (room.startsWith('guest')) {
                const button = document.createElement('button');
                button.innerText = `Room ${room}`;
                button.onclick = () => joinRoom(room);
                roomDiv.appendChild(button);
            } else {
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = room;
                checkbox.classList.add('checkbox');
                checkbox.style.display = 'none'; // 체크박스 숨김
                roomDiv.appendChild(checkbox);

                const button = document.createElement('button');
                button.innerText = `Room ${room}`;
                button.onclick = () => joinRoom(room);
                roomDiv.appendChild(button);
            }

            chatRooms.appendChild(roomDiv);
        });
    });


    socket.on('new_room_id', function(room_id) {
        console.log("Received new room ID:", room_id);
        const chatRooms = document.getElementById('chatRooms');
        const roomDiv = document.createElement('div');
        roomDiv.classList.add('room');
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = room_id;
        checkbox.classList.add('checkbox');
        checkbox.style.display = 'none'; // 체크박스 숨김
        roomDiv.appendChild(checkbox);

        const button = document.createElement('button');
        button.innerText = `Room ${room_id}`;
        button.onclick = () => joinRoom(room_id);
        roomDiv.appendChild(button);

        chatRooms.appendChild(roomDiv);
    });

    socket.on('room_deleted', function(room_id) {
        console.log("Room deleted:", room_id);
        const chatRooms = document.getElementById('chatRooms');
        const roomDivs = chatRooms.querySelectorAll('.room');
        roomDivs.forEach(roomDiv => {
            const checkbox = roomDiv.querySelector('input[type="checkbox"]');
            if (checkbox.value === room_id) {
                roomDiv.remove();
            }
        });
    });
});

socket.on('message', function(data) {
    const messages = document.getElementById('messages');
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    if (data.sender === 'Manager') {
        messageElement.classList.add('sent');
    } else {
        messageElement.classList.add('received');
    }
    messageElement.innerText = `${data.message}`;
    messages.appendChild(messageElement);
    messages.scrollTop = messages.scrollHeight;
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const message = messageInput.value.trim();
    if (message) {
        socket.emit('message', { room: currentRoom, message: message, sender: 'Manager' });
        messageInput.value = '';
    }
}

document.getElementById('messageInput').addEventListener('keyup', function(event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        sendMessage();
    }
});

// Room guest의 ID 확인
console.log("Room guest ID:", currentRoom);
