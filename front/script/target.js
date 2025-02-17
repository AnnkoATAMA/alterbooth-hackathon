document.getElementById("goalForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const goalInput = document.getElementById("goalInput").value;
    const userId = document.getElementById("userId").value; // 🔥 追加

    if (!goalInput) {
        alert("目標を入力してください");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/api/target/create", {  // ✅ URL から userId を削除
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ user_id: userId, target: goalInput })  // ✅ user_id を body に含める
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("保存成功:", result);
        addGoalToList(result.target);
        document.getElementById("goalInput").value = "";

    } catch (error) {
        console.error("エラー:", error);
        alert("目標の保存に失敗しました");
    }
});
function addGoalToList(goal) {
    const goalsList = document.getElementById("goals");
    const listItem = document.createElement("li");
    listItem.textContent = goal;
    goalsList.appendChild(listItem);
}
