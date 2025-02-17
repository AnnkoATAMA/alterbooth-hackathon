// src/target.js

let goals = [];

function saveGoal(goal) {
    goals.push(goal);
    localStorage.setItem('goals', JSON.stringify(goals));
}

function loadGoals() {
    const savedGoals = localStorage.getItem('goals');
    if (savedGoals) {
        goals = JSON.parse(savedGoals);
    }
}

function displayGoals() {
    const goalList = document.getElementById('goal-list');
    goalList.innerHTML = '';
    goals.forEach((goal, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = `${index + 1}: ${goal}`;
        goalList.appendChild(listItem);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadGoals();
    displayGoals();

    const goalForm = document.getElementById('goal-form');
    goalForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const goalInput = document.getElementById('goal-input');
        const goal = goalInput.value;
        if (goal) {
            saveGoal(goal);
            displayGoals();
            goalInput.value = '';
        }
    });
});

document.getElementById('goalForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const goalInput = document.getElementById('goalInput').value;
    const userId = document.getElementById('userId').value;

    const response = await fetch('http://localhost:8000/api/goals', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, goal: goalInput })
    });

    const newGoal = await response.json();
    addGoalToList(newGoal);
    document.getElementById('goalInput').value = '';
});

async function fetchGoals() {
    const userId = document.getElementById('userId').value;
    const response = await fetch(`http://localhost:8000/api/goals/${userId}`);
    const goals = await response.json();
    goals.forEach(addGoalToList);
}

function addGoalToList(goal) {
    const goalList = document.getElementById('goals');
    const li = document.createElement('li');
    li.textContent = goal.goal;
    goalList.appendChild(li);
}

fetchGoals();