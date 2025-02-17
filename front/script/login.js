document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    if (result.success) {
        // ログイン成功時の処理
        localStorage.setItem('userId', result.userId);
        window.location.href = 'target.html';
    } else {
        // ログイン失敗時の処理
        alert('ログインに失敗しました。');
    }
});