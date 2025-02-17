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

async function addSubTask(parentId) {
    const userId = document.getElementById("userId").value;
    const subTaskName = prompt("子タスク名を入力してください");

    if (!subTaskName) return;

    try {
        const response = await fetch("http://localhost:8000/api/target/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ user_id: userId, target: subTaskName, parent_id: parentId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ 子タスク追加成功");
        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("子タスクの追加に失敗しました");
    }
}

function displayTargets(targets, parentElement = null) {
    const goalsList = parentElement || document.getElementById("goals");
    goalsList.innerHTML = '';

    targets.forEach(target => {
        const listItem = document.createElement("li");

        const taskText = document.createElement("span");
        taskText.textContent = `${target.target} ${target.status ? "✅" : "❌"}`;
        listItem.appendChild(taskText);

        const addSubTaskButton = document.createElement("button");
        addSubTaskButton.textContent = "＋ 子タスク追加";
        addSubTaskButton.style.marginLeft = "10px";
        addSubTaskButton.addEventListener("click", () => addSubTask(target.target_id));
        listItem.appendChild(addSubTaskButton);

        const toggleButton = document.createElement("button");
        toggleButton.textContent = target.status ? "未達成にする" : "達成";
        toggleButton.style.marginLeft = "10px";
        toggleButton.addEventListener("click", () => toggleGoalStatus(target.target_id, !target.status));
        listItem.appendChild(toggleButton);

        const weightSelect = document.createElement("select");
        ["高い", "普通", "低い"].forEach((label, index) => {
            const option = document.createElement("option");
            option.value = index + 1;
            option.textContent = label;
            if (index + 1 === target.weight) {
                option.selected = true;
            }
            weightSelect.appendChild(option);
        });

        weightSelect.style.marginLeft = "10px";
        weightSelect.addEventListener("change", () => updateGoalWeight(target.target_id, weightSelect.value));
        listItem.appendChild(weightSelect);

        if (target.subtasks && target.subtasks.length > 0) {
            const subList = document.createElement("ul");
            displayTargets(target.subtasks, subList);
            listItem.appendChild(subList);
        }

        goalsList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', loadGoals);

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

        console.log("✅ 目標の追加成功");
        document.getElementById("goalInput").value = "";

        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("目標の保存に失敗しました");
    }
});

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

        console.log("✅ 状態変更成功");
        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("状態変更に失敗しました");
    }
}

async function updateGoalWeight(targetId, newWeight) {
    if (!targetId) {
        console.error("❌ エラー: targetId が undefined です");
        return;
    }

    console.log(`🎯 [DEBUG] 重要度変更リクエスト: targetId=${targetId}, weight=${newWeight}`);

    try {
        const response = await fetch(`http://localhost:8000/api/weight/weight`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ target_id: targetId, importance: Number(newWeight) })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ 重要度変更成功");
        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("重要度の変更に失敗しました");
    }
}

document.addEventListener('DOMContentLoaded', loadGoals);
