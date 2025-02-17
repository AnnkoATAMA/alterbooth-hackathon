async function checkAuth() {
    try {
        console.log("🔄 [AUTH] 認証チェック開始...");
        const response = await fetch("http://localhost:8000/api/auth/check-auth", {
            method: "GET",
            credentials: "include",
            headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0"
            }
        });

        if (!response.ok) {
            throw new Error(`Unauthorized (status: ${response.status})`);
        }

        const userData = await response.json();
        console.log("✅ [AUTH] 認証成功: ", userData);

        if (userData.name) {
            localStorage.setItem('username', userData.name);
        }

        return userData.userId;
    } catch (error) {
        console.warn("❌ [AUTH] 未ログイン: ", error);
        alert("ログインセッションが切れています。ログイン画面へ移動します。");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    }
}
window.onload = checkAuth;
