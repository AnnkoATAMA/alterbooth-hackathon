async function loadGoals() {
    const userId = document.getElementById("userId").value;
    try {
        const response = await fetch(`http://localhost:8000/api/targets?userId=${userId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const targets = await response.json();
        displayTargets(targets);
    } catch (error) {
        console.error("エラー:", error);
    }
}

function displayTargets(targets) {
    const goalsList = document.getElementById("goals");
    goalsList.innerHTML = '';

    targets.forEach(target => {
        const listItem = document.createElement("li");
        listItem.textContent = target.name + (target.achieved ? " (達成済)" : " (未達成)");

        if (!target.achieved) {
            const changeButton = document.createElement("button");
            changeButton.textContent = "変更";
            changeButton.addEventListener("click", () => changeGoal(target.id));
            listItem.appendChild(changeButton);
        }

        goalsList.appendChild(listItem);
    });
}

async function changeGoal(targetId) {
    try {
        const response = await fetch(`http://localhost:8000/api/target/${targetId}/activate`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({ target_id: targetId })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("変更成功:", result);
        loadGoals(); 

    } catch (error) {
        console.error("エラー:", error);
        alert("変更に失敗しました");
    }
}

// ページ読み込み時に過去の目標を読み込む
document.addEventListener('DOMContentLoaded', loadGoals);