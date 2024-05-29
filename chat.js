var my_id = '0';
var my_ai_pre_message = '';
var userEmail = '';
var currentLanguage = 'kor'; // 현재 언어 설정

// Deepl API를 사용하여 메시지 번역하는 함수
function translateMessage(text, targetLang) {
    var deeplAPIKey = '929fcdd7-b79a-4bbc-9737-dc580ac5a12f'; // Deepl API 키를 여기에 입력
    var deeplEndpoint = 'https://api.deepl.com/v2/translate'; // Deepl API 엔드포인트

    // 번역할 언어 코드 설정
    var langCode = targetLang === 'kor' ? 'KO' : 'EN';

    return fetch(deeplEndpoint + '?auth_key=' + deeplAPIKey + '&text=' + encodeURIComponent(text) + '&target_lang=' + langCode)
        .then(response => response.json())
        .then(data => {
            // 번역된 텍스트에 줄바꿈 추가
            var translatedText = data.translations[0].text.replace(/\n/g, '<br>');
            return translatedText;
        });
}

// 언어 선택 버튼의 onclick 이벤트 핸들러
function changeLanguage(targetLang) {
    // 언어 변경
    currentLanguage = targetLang;

    var languageButtons = document.getElementsByClassName('language-buttons');
    var messages = document.getElementsByClassName('message');
    // 메시지 번역
    Array.from(messages).forEach(message => {
        translateMessage(message.textContent, targetLang)
            .then(translatedText => {
                if (message.classList.contains('ai')) {
                    console.log(message.innerHTML);
                    message.innerHTML = translatedText; // AI 메시지의 경우 내용 그대로 전달
                } else {
                    message.textContent = translatedText; // 그 외의 메시지는 텍스트만 전달
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}

async function sendMessage(messageToSend = null, selectedDateTime = null, reset = false) {
    var chatContainer = document.getElementById('chat-container');
    var messageInput = document.getElementById('message-input');
    var message = (messageToSend || messageInput.value).trim();
    if (reset) {
        my_id = '0';
    }
    if (message) {
        var customerMsg = document.createElement('div');
        customerMsg.classList.add('message', 'customer');
        customerMsg.textContent = message;
        
        // AI 메시지와 고객 메시지 출력
        try {
            var translatedMessage = await translateMessage(message, 'EN');
            var transCustomerMsg = document.createElement('div');
            transCustomerMsg.classList.add('message', 'customer');
            transCustomerMsg.textContent = translatedMessage;
            if (currentLanguage === 'eng') {
                chatContainer.appendChild(transCustomerMsg); // eng-btn이 눌렸을 때 번역된 메시지 출력
            } else {
                chatContainer.appendChild(customerMsg); // eng-btn가 눌리지 않았을 때 원본 메시지 출력
            }
        } catch (error) {
            console.error('Error:', error);
        }
        
        var url = `http://spacechat.co.kr:60000/send_message/?my_id=${my_id}&email=${encodeURIComponent(userEmail)}&message=${encodeURIComponent(message)}&my_ai_pre_message=${my_ai_pre_message}&selectedDateTime=${selectedDateTime}`;
        
        try {
            var response = await fetch(url);
            var data = await response.json();
            if (!reset) {
                my_id = data.my_id;
                my_ai_pre_message = data.return_message;
            }
            var aiMsg = document.createElement('div');
            aiMsg.classList.add('message', 'ai');
            if (data.return_message) {
                aiMsg.innerHTML = data.return_message.replace(/\n/g, '<br>');
                if (currentLanguage === 'eng') { // eng-btn이 눌렸을 때 AI 메시지 번역 실행
                    try {
                        var translatedAI = await translateMessage(data.return_message, 'EN');
                        var transAiMsg = document.createElement('div');
                        transAiMsg.classList.add('message', 'ai');
                        transAiMsg.innerHTML = translatedAI.replace(/\n/g, '<br>');
                        chatContainer.appendChild(transAiMsg);
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else { // eng-btn가 눌리지 않았을 때 번역 실행하지 않고 원본 메시지 출력
                    chatContainer.appendChild(aiMsg);
                }
            }
            var menuItems = (data.return_menu && typeof data.return_menu === 'string') ? data.return_menu.split(',') : [];

            if (menuItems.includes('날짜위젯')) {
                handleDateWidget(); 
            } else if (menuItems.includes('OK')) {
                var confirmButton = document.createElement('button');
                confirmButton.textContent = 'OK';
                confirmButton.classList.add('menu-button');
                confirmButton.onclick = function() {
                    sendMessage('확인');
                    sendMessage(selectedDateTime);
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
        } catch (error) {
            console.error('Error:', error);
            var errorMsg = document.createElement('div');
            errorMsg.classList.add('message', 'error');
            errorMsg.textContent = '오류 발생: ' + error;
            chatContainer.appendChild(errorMsg);
        }

        if (!messageToSend) {
            messageInput.value = '';
        }
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
}

function handleAvailableTimes(times) {
    var availableTimes = times.split(',');
    flatpickr(dateWidget, {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: "today",
        onClose: function(selectedDates, dateStr, instance) {
            // Logic for handling selected date and time
        },
        disable: availableTimes.map(function(time) {
            return function(date) {
                var hour = date.getHours();
                var minute = date.getMinutes();
                return availableTimes.indexOf(`${hour}:${minute}`) === -1;
            }
        })
    });
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
    confirmButton.textContent = 'OK';
    confirmButton.classList.add('menu-button');
    confirmButton.disabled = true;
    chatContainer.appendChild(confirmButton);

    confirmButton.addEventListener('click', function() {
        var selectedDateTime = dateWidget.value;
        sendMessage('OK', selectedDateTime);
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
            createTimeButtons(selectedDate);
        }
    });
    createTimeButtons(new Date());
}
document.getElementById('send-btn').addEventListener('click', () => {
    console.log('send-btn');
    sendMessage();
});

document.getElementById('message-input').addEventListener('keypress', function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        console.log('message-input');
        sendMessage();
    }
});

// overlay 클릭 시 사이드바 닫기
overlay.addEventListener('click', function() {
    sidebar.style.right = '-250px';
    overlay.style.display = 'none';
});

window.onload = function() {
    userEmail = new URLSearchParams(window.location.search).get('email');
    console.log("Loaded userEmail:", userEmail);
    var promptText = userEmail ? userEmail + "로 입장했습니다." : "비회원으로 입장했습니다.";
    sendMessage(promptText, false);

    // 햄버거 아이콘 클릭 시 사이드바 토글
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    var menuIcon = document.getElementById('menu-icon');

    menuIcon.addEventListener('click', function() {
        if (sidebar.style.right === '0px') {
            sidebar.style.right = '-250px';
            overlay.style.display = 'none';
        } else {
            sidebar.style.right = '0';
            overlay.style.display = 'block';
        }
    });

    // 페이지 로드 후 햄버거 아이콘이 눌린 상태로 설정
    menuIcon.click(); 

    // Side menu가 열릴 때 Home 화면의 menu-icon을 숨김
    sidebar.addEventListener('transitionend', function() {
        if (sidebar.style.right === '0px') {
            menuIcon.style.display = 'none';
        } else {
            menuIcon.style.display = 'block';
        }
        });
};

// 언어 선택 버튼의 onclick 이벤트 핸들러
document.getElementById('kor-btn').addEventListener('click', function() {
    changeLanguage('kor');
});

document.getElementById('eng-btn').addEventListener('click', function() {
    changeLanguage('eng');
});
