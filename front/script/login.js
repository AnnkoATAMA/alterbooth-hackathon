document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const response = await fetch('http://localhost:8000/api/login/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
    });

    const result = await response.json();

    if (result.success) {
        // ✅ ログイン成功時に userId を保存し、画面遷移
        localStorage.setItem('userId', result.userId);
        window.location.href = 'target.html';
    } else {
        alert('ログインに失敗しました。');
    }
});
