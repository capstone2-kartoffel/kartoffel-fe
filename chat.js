var my_id = '0';
var my_ai_pre_message = '';
var userEmail = '';
var currentLanguage = 'kor'; // 현재 언어 설정
var promptText = '';

// Deepl API를 사용하여 메시지 언어를 감지하는 함수
async function detectLanguage(text) {
    var deeplAPIKey = '929fcdd7-b79a-4bbc-9737-dc580ac5a12f'; // Deepl API 키를 여기에 입력
    var deeplEndpoint = 'https://api.deepl.com/v2/translate'; // Deepl API 엔드포인트

    return fetch(deeplEndpoint + '?auth_key=' + deeplAPIKey + '&text=' + encodeURIComponent(text) + '&target_lang=EN')
    .then(response => response.json())
    .then(data => {
        // 언어 코드를 대문자로 변환하여 반환
        var detectedLang = data.translations[0].detected_source_language.toUpperCase();
        // 만약 검출된 언어가 한국어라면, 언어 코드를 영어로 변경하여 반환
        return detectedLang;
    
    });
}

//customer message를 한국어로 번역 -> sendMessage로 보내려고
function translateKor(detectedLang, text) {
    var deeplAPIKey = '929fcdd7-b79a-4bbc-9737-dc580ac5a12f'; // Deepl API 키를 여기에 입력
    var deeplEndpoint = 'https://api.deepl.com/v2/translate'; // Deepl API 엔드포인트

    // 번역할 언어 코드 설정 (한국어로 고정)
    var targetLang = 'KO';

    return fetch(deeplEndpoint + '?auth_key=' + deeplAPIKey + '&text=' + encodeURIComponent(text) + '&source_lang=' + detectedLang + '&target_lang=' + targetLang)
        .then(response => response.json())
        .then(data => {
            if (data.translations && data.translations.length > 0 && data.translations[0].text) {
                // 번역된 텍스트에 줄바꿈 추가
                var translatedText = data.translations[0].text.replace(/\n/g, '<br>');
                //console.log("Translated text: " + translatedText);
                return translatedText;
            } else {
                throw new Error('Unexpected response from DeepL API');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            throw error; // sendMessage 함수에서 추가 처리를 위해 오류를 다시 던집니다
        });
}
//수정됨
async function changeLanguage(targetLang) {
    // 언어 변경
    currentLanguage = targetLang;
    var messages = document.getElementsByClassName('message');

    // sidebar가 열려있는지 확인하여 열려 있다면 닫기
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('overlay');
    if (sidebar.style.right === '0px') {
        sidebar.style.right = '-250px';
        overlay.style.display = 'none';
    }

    var detectedStartMsg = await detectLanguage(promptText);
    var promptarr = [
        await translateMsg(promptText, detectedStartMsg, 'EN'), 
        await translateMsg(promptText, detectedStartMsg, 'KO'),
        await translateMsg(promptText, detectedStartMsg, 'JA'),
        await translateMsg(promptText, detectedStartMsg, 'ZH')
    ]; // 번역된 결과를 저장할 배열

    // 메시지 번역
    for (let i = 0; i < messages.length; i++) {
        let message = messages[i];
        if (promptarr.includes(message.textContent)){
            try {
                if (targetLang === 'eng') {
                    var detectedLang = await detectLanguage(promptText);
                    var translatedPrompt = await translateMsg(promptText, detectedLang, 'EN');
                    message.innerHTML = translatedPrompt;
                }
                if (targetLang === 'kor') {
                    var detectedLang = await detectLanguage(promptText);
                    var translatedPrompt = await translateMsg(promptText, detectedLang, 'KO');
                    message.innerHTML = translatedPrompt;
                }
                if (targetLang === 'jap') {
                    var detectedLang = await detectLanguage(promptText);
                    var translatedPrompt = await translateMsg(promptText, detectedLang, 'JA');
                    message.innerHTML = translatedPrompt;
                }
                if (targetLang === 'chi') {
                    var detectedLang = await detectLanguage(promptText);
                    var translatedPrompt = await translateMsg(promptText, detectedLang, 'ZH');
                    message.innerHTML = translatedPrompt;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }   
        try {
            if (targetLang === 'eng' && message.classList.contains('ai')) {
                var detectedLang = await detectLanguage(message.textContent);
                var translatedAiMsg = await translateMsg(message.textContent, detectedLang, 'EN');
                message.innerHTML = translatedAiMsg;
            }
            else if (targetLang === 'kor' && message.classList.contains('ai')) {
                var detectedLang = await detectLanguage(message.textContent);
                var translatedAiMsg = await translateMsg(message.textContent, detectedLang, 'KO');
                message.innerHTML = translatedAiMsg;
            }
            else if (targetLang === 'jap' && message.classList.contains('ai')) {
                var detectedLang = await detectLanguage(message.textContent);
                var translatedAiMsg = await translateMsg(message.textContent, detectedLang, 'JA');
                message.innerHTML = translatedAiMsg;
            }
            else if (targetLang === 'chi' && message.classList.contains('ai')) {
                var detectedLang = await detectLanguage(message.textContent);
                var translatedAiMsg = await translateMsg(message.textContent, detectedLang, 'ZH');
                message.innerHTML = translatedAiMsg;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}



async function translateMsg(text, sourceLang, targetLang) {
    var deeplAPIKey = '929fcdd7-b79a-4bbc-9737-dc580ac5a12f'; // Deepl API 키를 여기에 입력
    var deeplEndpoint = 'https://api.deepl.com/v2/translate'; // Deepl API 엔드포인트
    try {
        var response = await fetch(deeplEndpoint + '?auth_key=' + deeplAPIKey + '&text=' + encodeURIComponent(text) + '&source_lang=' + sourceLang + '&target_lang=' + targetLang);
        var data = await response.json();
        if (data.translations && data.translations.length > 0 && data.translations[0].text) {
            // 번역된 텍스트에 줄바꿈 추가
            var translatedText = data.translations[0].text.replace(/\n/g, '<br>');
            return translatedText;
        } else {
            throw new Error('Unexpected response from DeepL API');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
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
        customerMsg.innerHTML = message.replace(/\n/g, '<br>');
        console.log("customer Msg: " + message);
        chatContainer.appendChild(customerMsg);

        var cusTranMsg = message;

        var detectedLang = await detectLanguage(message);
        try {
            // 메시지를 한국어로 번역
            cusTranMsg = await translateKor(detectedLang, message);
        } catch (error) {
            console.error('Error:', error);
        }

        var url = `http://spacechat.co.kr:60000/send_message/?my_id=${my_id}&email=${encodeURIComponent(userEmail)}&message=${encodeURIComponent(cusTranMsg)}&my_ai_pre_message=${my_ai_pre_message}&selectedDateTime=${selectedDateTime}`;

        try {
            var response = await fetch(url);
            var data = await response.json();
            if (!reset) {
                my_id = data.my_id;
                my_ai_pre_message = data.return_message;
            }

            // AI message 처리
            var aiMessageContainer = document.createElement('div');
            aiMessageContainer.classList.add('ai-message-container');

            var aiIcon = document.createElement('div');
            aiIcon.classList.add('ai-icon');
            aiMessageContainer.appendChild(aiIcon);

            var aiMsg = document.createElement('div');
            aiMsg.classList.add('message', 'ai');

            if (data.return_message) {
                aiMsg.innerHTML = data.return_message.replace(/\n/g, '<br>');
                var detectedLang = await detectLanguage(data.return_message);

                if (currentLanguage === 'eng') {
                    try {
                        var translatedAI = await translateMsg(data.return_message, detectedLang, 'EN');
                        aiMsg.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'jap') {
                    try {
                        var translatedAI = await translateMsg(data.return_message, detectedLang, 'JA');
                        aiMsg.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'chi') {
                    try {
                        var translatedAI = await translateMsg(data.return_message, detectedLang, 'ZH');
                        aiMsg.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'kor') {
                    try {
                        var translatedAI = await translateMsg(data.return_message, detectedLang, 'KO');
                        aiMsg.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            }

            if (data.prediction) {
                const modelResponse = data.prediction;
                console.log("문의하기 답변 원본: " + modelResponse);
                var detectedLang = await detectLanguage(data.prediction);
                var modelMsgElement = document.createElement('div');
                modelMsgElement.classList.add('message', 'ai');
                modelMsgElement.innerHTML = modelResponse.replace(/\n/g, '<br>');
                aiMessageContainer.appendChild(modelMsgElement);

                if (currentLanguage === 'eng') {
                    try {
                        var translatedAI = await translateMsg(data.prediction, detectedLang, 'EN');
                        modelMsgElement.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'jap') {
                    try {
                        var translatedAI = await translateMsg(data.prediction, detectedLang, 'JA');
                        modelMsgElement.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'chi') {
                    try {
                        var translatedAI = await translateMsg(data.prediction, detectedLang, 'ZH');
                        modelMsgElement.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                } else if (currentLanguage === 'kor') {
                    try {
                        var translatedAI = await translateMsg(data.prediction, detectedLang, 'KO');
                        modelMsgElement.innerHTML = translatedAI.replace(/\n/g, '<br>');
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }

                // 수정: 한 번만 AI 메시지 추가
                if (currentLanguage !== 'kor') {
                    aiMessageContainer.appendChild(aiMsg);
                }
                aiMessageContainer.appendChild(modelMsgElement);
            } else {
                // 수정: AI 메시지를 한 번만 추가
                aiMessageContainer.appendChild(aiMsg);
            }

            chatContainer.appendChild(aiMessageContainer);

            var menuItems = (data.return_menu && typeof data.return_menu === 'string') ? data.return_menu.split(',') : [];

            if (menuItems.includes('날짜위젯')) {
                handleDateWidget();
            } else if (menuItems.includes('OK')) {
                var confirmButton = document.createElement('button');
                confirmButton.textContent = 'OK';
                confirmButton.classList.add('menu-button');
                confirmButton.onclick = function () {
                    sendMessage('확인');
                    sendMessage(selectedDateTime);
                };
                chatContainer.appendChild(confirmButton);
            } else if (menuItems.length > 0) {
                var menuContainer = document.createElement('div');
                menuContainer.classList.add('menu-container');
                menuItems.forEach(item => {
                    var button = document.createElement('button');
                    button.textContent = item.trim();
                    button.classList.add('menu-button');
                    button.onclick = function () { sendMessage(item.trim()); };
                    menuContainer.appendChild(button);
                });
                chatContainer.appendChild(menuContainer);
            }
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        catch (error) {
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

    function checkEnableConfirmButton() {
        if (dateWidget.value && dateWidget.value.split(' ').length === 2) {
            confirmButton.disabled = false;
        } else {
            confirmButton.disabled = true;
        }
    }

    function createTimeButtons(selectedDate) {
        var now = new Date();
        var minHour = selectedDate.getDate() === now.getDate() ? now.getHours() : 10;
        var maxHour = selectedDate.getDate() === now.getDate() ? 21 : 21; // Max hour set to 21 (9 PM)
        timeButtonsContainer.innerHTML = ''; // Clear previous buttons

        for (var hour = minHour; hour <= maxHour; hour++) {
            for (var minute = 0; minute < 60; minute += 60) {
                if (selectedDate.getDate() === now.getDate() && hour === now.getHours() && minute < now.getMinutes()) {
                    continue;
                }
                var timeButton = document.createElement('button');
                timeButton.textContent = `${hour < 10 ? '0' + hour : hour}:${minute === 0 ? '00' : minute}`;
                timeButton.classList.add('time-button');
                timeButton.onclick = function() {
                    var selectedTime = this.textContent;
                    var dateValue = dateWidget.value.split(' ')[0];
                    dateWidget.value = `${dateValue} ${selectedTime}`;
                    checkEnableConfirmButton();
                };
                timeButtonsContainer.appendChild(timeButton);
            }
        }
    }
    var now = new Date();
    var minDate = now.getHours() >= 21 ? new Date(now.getTime() + 24 * 60 * 60 * 1000) : now;
    flatpickr(dateWidget, {
        enableTime: false,
        dateFormat: "Y-m-d",
        minDate: minDate,
        maxDate: new Date().fp_incr(30),
        onClose: function(selectedDates, dateStr, instance) {
            confirmButton.disabled = true;
            var selectedDate = new Date(dateStr);
            createTimeButtons(selectedDate);
        }
    });

    if (now.getHours() < 21) {
        createTimeButtons(now);
    }
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

window.onload = async function() {
    userEmail = new URLSearchParams(window.location.search).get('email');
    console.log("Loaded userEmail:", userEmail);
    promptText = userEmail ? userEmail + " 님 입장했습니다" : "비회원으로 입장했습니다.";
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

    var profileIcon = document.getElementById('profile-icon');
    profileIcon.addEventListener('click', function() {
        if (userEmail) {
            window.location.href = 'mypage.html?email=' + userEmail;
        } else {
            window.location.href = 'login.html';
        }
    });
};

// 언어 선택 버튼의 onclick 이벤트 핸들러
document.getElementById('kor-btn').addEventListener('click', function() {
    changeLanguage('kor');  //target language를 kor로!
    document.getElementById('language-icon').style.backgroundImage = "url('kr-icon.png')";
});
document.getElementById('eng-btn').addEventListener('click', function() {
    changeLanguage('eng');
    document.getElementById('language-icon').style.backgroundImage = "url('eng-icon.png')";
});
document.getElementById('jap-btn').addEventListener('click', function() {
    changeLanguage('jap');
    document.getElementById('language-icon').style.backgroundImage = "url('jp-icon.png')";
});
document.getElementById('chi-btn').addEventListener('click', function() {
    changeLanguage('chi');
    document.getElementById('language-icon').style.backgroundImage = "url('ch-icon.png')";
});

document.getElementById('language-icon').style.backgroundImage = "url('default-icon.png')";

// language-icon 클릭 시 순서대로 한국어, 영어, 일본어, 중국어로 번역되고 아이콘도 각 언어에 맞게 변경
document.getElementById('language-icon').addEventListener('click', function() {
    var currentIcon = document.getElementById('language-icon').style.backgroundImage;
    if (currentIcon.includes('default-icon.png')) {
        changeLanguage('kor');
        document.getElementById('language-icon').style.backgroundImage = "url('kr-icon.png')";
    } else if (currentIcon.includes('kr-icon.png')) {
        changeLanguage('eng');
        document.getElementById('language-icon').style.backgroundImage = "url('eng-icon.png')";
    } else if (currentIcon.includes('eng-icon.png')) {
        changeLanguage('jap');
        document.getElementById('language-icon').style.backgroundImage = "url('jp-icon.png')";
    } else if (currentIcon.includes('jp-icon.png')) {
        changeLanguage('chi');
        document.getElementById('language-icon').style.backgroundImage = "url('ch-icon.png')";
    } else if (currentIcon.includes('ch-icon.png')) {
        changeLanguage('kor');
        document.getElementById('language-icon').style.backgroundImage = "url('kr-icon.png')";
    }
});

document.getElementById('exit-icon').addEventListener('click', function() {
    window.location.href = 'index.html';
});