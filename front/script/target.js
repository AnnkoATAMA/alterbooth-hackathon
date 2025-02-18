let xp = 0;
let level = 1;

document.addEventListener('DOMContentLoaded', () => {
    loadGoals();
    updateLevelUI();
});

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
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
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
        const card = document.createElement("div");
        card.classList.add("task-card");

        const taskHeader = document.createElement("div");
        taskHeader.classList.add("task-header");

        const taskText = document.createElement("h3");
        taskText.textContent = `${target.target} ${target.status ? "✅" : "❌"}`;
        taskHeader.appendChild(taskText);

        const addSubTaskButton = document.createElement("button");
        addSubTaskButton.textContent = "＋ 子タスク追加";
        addSubTaskButton.classList.add("add-btn");
        addSubTaskButton.addEventListener("click", () => addSubTask(target.target_id));
        taskHeader.appendChild(addSubTaskButton);

        const toggleButton = document.createElement("button");
        toggleButton.textContent = target.status ? "未達成にする" : "達成";
        toggleButton.classList.add("toggle-btn");
        toggleButton.addEventListener("click", () => toggleGoalStatus(target.target_id, !target.status));
        taskHeader.appendChild(toggleButton);

        const weightSelect = document.createElement("select");
        ["高い", "普通", "低い"].forEach((label, index) => {
            const option = document.createElement("option");
            option.value = index + 1;
            option.textContent = label;
            if (index + 1 === target.weight) option.selected = true;
            weightSelect.appendChild(option);
        });

        weightSelect.addEventListener("change", () => updateGoalWeight(target.target_id, weightSelect.value));
        taskHeader.appendChild(weightSelect);

        card.appendChild(taskHeader);

        if (target.subtasks && target.subtasks.length > 0) {
            const toggleSubtasksButton = document.createElement("button");
            toggleSubtasksButton.textContent = "▶ 子タスク表示";
            toggleSubtasksButton.classList.add("toggle-subtasks");
            let isSubtasksVisible = false;

            const subTaskContainer = document.createElement("div");
            subTaskContainer.classList.add("subtasks");
            subTaskContainer.style.display = "none";

            toggleSubtasksButton.addEventListener("click", () => {
                isSubtasksVisible = !isSubtasksVisible;
                subTaskContainer.style.display = isSubtasksVisible ? "block" : "none";
                toggleSubtasksButton.textContent = isSubtasksVisible ? "▼ 子タスクを閉じる" : "▶ 子タスク表示";
            });

            card.appendChild(toggleSubtasksButton);
            displayTargets(target.subtasks, subTaskContainer);
            card.appendChild(subTaskContainer);
        }

        goalsList.appendChild(card);
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
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({ target_id: targetId, status: newStatus })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log("✅ 状態変更成功");
        if (newStatus) {
            gainXP(10);
        }
        loadGoals();
    } catch (error) {
        console.error("エラー:", error);
        alert("状態変更に失敗しました");
    }
}

// XP & レベルアップ
function gainXP(amount) {
    xp += amount;
    if (xp >= level * 100) {
        levelUp();
    }
    updateLevelUI();
}

function levelUp() {
    level++;
    xp = 0;
    showEffect("🚀 レベルアップ!", true);
}

function updateLevelUI() {
    document.getElementById("level-display").textContent = `レベル: ${level}`;
    document.getElementById("xp-display").textContent = `XP: ${xp} / ${level * 100}`;
    document.getElementById("xp-bar").style.width = `${(xp / (level * 100)) * 100}%`;
}

function showEffect(message, isBig = false) {
    const effect = document.createElement("div");
    effect.classList.add("effect");
    if (isBig) effect.classList.add("big-effect");
    effect.textContent = message;
    document.body.appendChild(effect);
    setTimeout(() => effect.remove(), 2000);
}
