async function loadGoals() {
    const userId = document.getElementById("userId").value;

    if (!userId) {
        console.error("❌ [ERROR] userId が取得できていません");
        return;
    }

    console.log(`🌟 [DEBUG] userId=${userId}`);

    try {
        const response = await fetch(`http://localhost:8000/api/target/targets?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const targets = await response.json();
        console.log("🎯 [DEBUG] 取得した目標:", targets);
        displayTargets(targets);
    } catch (error) {
        console.error("エラー:", error);
    }
}

document.getElementById("goalForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const goalInput = document.getElementById("goalInput").value;
    const userId = document.getElementById("userId").value;

    if (!goalInput) {
        alert("目標を入力してください");
        return;
    }

    try {
        const response = await fetch("http://localhost:8000/api/target/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ user_id: userId, target: goalInput })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("保存成功:", result);
        document.getElementById("goalInput").value = "";

        addGoalToList(result.target_id, goalInput, false);
    } catch (error) {
        console.error("エラー:", error);
        alert("目標の保存に失敗しました");
    }
});

function addGoalToList(targetId, goal, status) {
    const goalsList = document.getElementById("goals");
    const listItem = document.createElement("li");
    listItem.textContent = goal + (status ? " (達成済)" : " (未達成)");

    const toggleButton = document.createElement("button");
    toggleButton.textContent = status ? "未達成にする" : "達成";
    toggleButton.addEventListener("click", () => toggleGoalStatus(targetId, !status));
    listItem.appendChild(toggleButton);

    goalsList.appendChild(listItem);
}

function displayTargets(targets) {
    const goalsList = document.getElementById("goals");
    goalsList.innerHTML = '';

    targets.forEach(target => {
        addGoalToList(target.target_id, target.target, target.status);
    });
}

async function toggleGoalStatus(targetId, newStatus) {
    if (!targetId) {
        console.error("❌ エラー: targetId が undefined です");
        return;
    }

    console.log(`🎯 [DEBUG] 状態変更リクエスト: targetId=${targetId}, status=${newStatus}`);

    try {
        const response = await fetch(`http://localhost:8000/api/target/${targetId}/toggle`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ target_id: targetId, status: newStatus })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("状態変更成功:", result);
        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("状態変更に失敗しました");
    }
}

document.addEventListener('DOMContentLoaded', loadGoals);
