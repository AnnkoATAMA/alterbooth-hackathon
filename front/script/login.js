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
        body: JSON.stringify({ name, email, password }),
        credentials: 'include'
    });

    const result = await response.json();

    if (result.success) {
        setTimeout(() => {
            location.replace('index.html');
        }, 500);

    } else {
        alert('ログインに失敗しました。');
    }
});
