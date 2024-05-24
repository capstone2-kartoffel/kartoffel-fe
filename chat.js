var my_id = '0';
var my_ai_pre_message = '';
var userEmail = '';

function sendMessage(messageToSend = null, selectedDateTime = null, reset = false) {
    var chatContainer = document.getElementById('chat-container');
    var messageInput = document.getElementById('message-input');
    var message = messageToSend || messageInput.value.trim();
    if (reset) {
        my_id = '0';
    }
    if (message) {
        var customerMsg = document.createElement('div');
        customerMsg.classList.add('message', 'customer');
        customerMsg.textContent = message;
        chatContainer.appendChild(customerMsg);
        console.log(customerMsg);

        var url = `http://spacechat.co.kr:60000/send_message/?my_id=${my_id}&email=${encodeURIComponent(userEmail)}&message=${encodeURIComponent(message)}&my_ai_pre_message=${my_ai_pre_message}&selectedDateTime=${selectedDateTime}`;
        
        fetch(url)
            .then(response => response.json())
            .then(data => {
                if (!reset) {
                    my_id = data.my_id;
                    my_ai_pre_message = data.return_message;
                }
                var aiMsg = document.createElement('div');
                aiMsg.classList.add('message', 'ai');
                if (data.return_message) {
                    aiMsg.innerHTML = data.return_message.replace(/\n/g, '<br>');
                    chatContainer.appendChild(aiMsg);
                    console.log(aiMsg);
                }

                var menuItems = (data.return_menu && typeof data.return_menu === 'string') ? data.return_menu.split(',') : [];

                //console.log(menuItems)
                //날짜위젯이 오면, date widget 띄워줌
                if (menuItems.includes('날짜위젯')) {
                    handleDateWidget(); 
                } //확인이 오면, 버튼 생성
                else if (menuItems.includes('확인')) {
                    var confirmButton = document.createElement('button');
                    confirmButton.textContent = '확인';
                    confirmButton.classList.add('menu-button'); // Add a class for styling if needed
                    confirmButton.onclick = function() {
                        sendMessage('확인');
                        sendMessage(selectedDateTime); // sendMessage 함수로 선택된 날짜와 시간 전송
                    };
                    chatContainer.appendChild(confirmButton);
                } else if (data.prediction) {
                    const modelResponse = data.prediction;

                    var modelMsgElement = document.createElement('div');
                    modelMsgElement.classList.add('message', 'ai');
                    modelMsgElement.innerHTML = modelResponse.replace(/\n/g, '<br>');
                    chatContainer.appendChild(modelMsgElement);
                } else if (menuItems.length > 0) {
                    var menuContainer = document.createElement('div');
                    menuContainer.classList.add('menu-container');
                    menuItems.forEach(item => {
                        var button = document.createElement('button');
                        button.textContent = item.trim();
                        button.classList.add('menu-button');
                        button.onclick = function() { sendMessage(item.trim()); };
                        menuContainer.appendChild(button);
                    });
                    chatContainer.appendChild(menuContainer);
                }

                chatContainer.scrollTop = chatContainer.scrollHeight;
            })
            .catch(error => {
                console.error('Error:', error);
                var errorMsg = document.createElement('div');
                errorMsg.classList.add('message', 'error');
                errorMsg.textContent = '오류 발생: ' + error;
                chatContainer.appendChild(errorMsg);
            });

        if (!messageToSend) {
            messageInput.value = '';
        }
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function changeLanguage(language) {
    var messageInput = document.getElementById('message-input');
    var button = language === 'kor' ? document.getElementById('kor-btn') : document.getElementById('eng-btn');
    button.disabled = true;

    translateMessages(language)
        .then(translatedMessages => {
            messageInput.placeholder = translatedMessages.placeholder;
            document.getElementById('send-btn').textContent = translatedMessages.sendBtnText;
            button.disabled = false;
        })
        .catch(error => {
            console.error('Error translating messages:', error);
            alert('메시지를 번역하는 동안 오류가 발생했습니다.');
            button.disabled = false;
        });
}

function translateMessages(targetLanguage) {
    return new Promise((resolve, reject) => {
        var translatedMessages = {};
        // 플레이스홀더와 버튼 텍스트를 번역
        var placeholderText = targetLanguage === 'kor' ? '메시지를 입력하세요' : 'Enter your message';
        var sendBtnText = targetLanguage === 'kor' ? '메시지 보내기' : 'Send Message';
        translatedMessages.placeholder = placeholderText;
        translatedMessages.sendBtnText = sendBtnText;

        resolve(translatedMessages);
    });
}

function handleAvailableTimes(times) {
    // 예약 가능한 시간을 처리하는 로직을 작성
    var availableTimes = times.split(','); // 가능한 시간들을 쉼표로 구분하여 배열로 분리
    flatpickr(dateWidget, {
        enableTime: true, // 시간 선택을 가능하게 함
        dateFormat: "Y-m-d H:i", // 날짜 및 시간 형식 설정
        minDate: "today", // 현재 날짜 이후로만 선택할 수 있도록 설정
        onClose: function(selectedDates, dateStr, instance) { // 사용자가 날짜를 선택하고 달력을 닫을 때 실행됨
            // 이 부분에서는 선택된 날짜와 시간을 쿼리 문자열로 추가하는 부분입니다.
            // 여기서는 선택된 날짜와 시간을 확인 버튼 클릭 이벤트로 이동되어야 합니다.
        },
        // 사용자가 선택할 수 있는 가능한 시간들을 설정
        disable: availableTimes.map(function(time) {
            return function(date) {
                var hour = date.getHours();
                var minute = date.getMinutes();
                return availableTimes.indexOf(`${hour}:${minute}`) === -1; // 가능한 시간이 아닌 경우 비활성화
            }
        })
    });
    console.log('Available Times:', times);
}

function handleDateWidget() {
    
    var chatContainer = document.getElementById('chat-container');
    var dateWidget = document.createElement('input');
    dateWidget.setAttribute('type', 'text');
    dateWidget.setAttribute('id', 'date-widget');
    dateWidget.setAttribute('placeholder', '날짜를 선택하세요');
    chatContainer.appendChild(dateWidget);

    var timeButtonsContainer = document.createElement('div');
    timeButtonsContainer.classList.add('time-buttons-container');

    // 시간 버튼 생성 함수
    function createTimeButtons(selectedDate) {
        var now = new Date();
        var minHour = selectedDate.getDate() === now.getDate() ? now.getHours() : 10;
        var maxHour = selectedDate.getDate() === now.getDate() ? 22 : 22;

        for (var hour = minHour; hour < maxHour; hour++) {
            for (var minute = 0; minute < 60; minute += 60) {
                if (selectedDate.getDate() === now.getDate() && hour === now.getHours() && minute < now.getMinutes()) {
                    continue;
                }
                var timeButton = document.createElement('button');
                timeButton.textContent = `${hour < 10 ? '0' + hour : hour}:${minute === 0 ? '00' : minute}`;
                timeButton.classList.add('time-button');
                timeButton.onclick = function() {
                    var selectedTime = this.textContent;
                    var selectedDateTime = dateWidget.value ? `${dateWidget.value} ${selectedTime}` : selectedTime;
                    dateWidget.value = selectedDateTime;
                    confirmButton.disabled = false;
                };
                timeButtonsContainer.appendChild(timeButton);
            }
        }
    }

    chatContainer.appendChild(timeButtonsContainer);
    var confirmButton = document.createElement('button');
    confirmButton.textContent = '확인';
    confirmButton.classList.add('menu-button');
    confirmButton.disabled = true;
    chatContainer.appendChild(confirmButton);

    confirmButton.addEventListener('click', function() {
        var selectedDateTime = dateWidget.value;
        sendMessage('확인', selectedDateTime);
    });

    flatpickr(dateWidget, {
        enableTime: false,
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: new Date().fp_incr(30),
        minTime: new Date().getHours() + ":" + new Date().getMinutes(),
        maxTime: "21:00",
        minuteIncrement: 60,
        onClose: function(selectedDates, dateStr, instance) {
            confirmButton.disabled = false;
            timeButtonsContainer.innerHTML = '';
            var selectedDate = new Date(dateStr); 
            createTimeButtons(selectedDate); // 수정된 부분: 날짜 선택 시 시간 버튼 생성
        }
    });
    // 초기에 시간 버튼 생성
    createTimeButtons(new Date());
}

document.getElementById('send-btn').addEventListener('click', () => sendMessage());

document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        sendMessage();
        event.preventDefault();
    }
});

function translateAndSendMessage(message, targetLanguage) {
    translateMessage(message, targetLanguage)
        .then(translatedMessage => {
            sendMessage(translatedMessage, false);
        })
        .catch(error => {
            console.error('Error translating message:', error);
            alert('메시지를 번역하는 동안 오류가 발생했습니다.');
        });
}

document.getElementById('kor-btn').addEventListener('click', function() {
    translateAndSendMessage("비회원으로 입장했습니다.", "kor");
});

document.getElementById('eng-btn').addEventListener('click', function() {
    translateAndSendMessage("비회원으로 입장했습니다.", "eng");
});


window.onload = function() {
    userEmail = new URLSearchParams(window.location.search).get('email');
    console.log("Loaded userEmail:", userEmail); // 로그 추가하여 이메일 값 확인
    var promptText = userEmail ? userEmail + "로 입장했습니다." : "비회원으로 입장했습니다.";
    sendMessage(promptText, false);
};
