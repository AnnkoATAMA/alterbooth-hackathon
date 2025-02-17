// This file implements the logic for displaying past goals and calculating their achievement levels.

document.addEventListener('DOMContentLoaded', () => {
    const goalsList = document.getElementById('goals-list');
    const goals = JSON.parse(localStorage.getItem('goals')) || [];

    function displayGoals() {
        goalsList.innerHTML = '';
        goals.forEach(goal => {
            const listItem = document.createElement('li');
            listItem.textContent = `${goal.title} - Achieved: ${goal.achieved ? 'Yes' : 'No'}`;
            goalsList.appendChild(listItem);
        });
    }

    displayGoals();
});