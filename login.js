document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').onsubmit = function(event) {
        event.preventDefault();
        var email = encodeURIComponent(document.querySelector('input[name="email"]').value);
        var password = encodeURIComponent(CryptoJS.SHA256(document.querySelector('input[name="password"]').value).toString());

        var url = `http://spacechat.co.kr:60000/server_login/?email=${email}&password=${password}`;

        fetch(url, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                console.log('Status:', data.status);
                if (data.status === 'success') {
                    window.location.href = `chat.html?email=${email}`; // 로그인 성공 시 chat.html로 이동하며 email을 URL 파라미터로 전달
                } else {
                    alert('Login failed. Please check your email and password.'); // 로그인 실패 시 알림
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('An error occurred while processing your request. Please try again later.'); // 오류 발생 시 알림
            });
    };

    // "Start without login" 버튼 클릭 이벤트 리스너
    document.getElementById('startWithoutLoginBtn').onclick = function() {
        window.location.href = 'chat.html'; // chat.html로 이동
    };
});
