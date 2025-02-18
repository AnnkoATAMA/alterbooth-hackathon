document.addEventListener("DOMContentLoaded", function () {
    const roomList = document.getElementById("roomList");
    const userList = document.getElementById("userList"); // ユーザー一覧
    const taskList = document.getElementById("taskList"); // タスク一覧

    async function loadRooms() {
        try {
            const response = await fetch(`http://localhost:8000/api/room/my_rooms`);
            if (!response.ok) throw new Error("Failed to load rooms");

            const rooms = await response.json();
            roomList.innerHTML = ""; // リストをクリア

            if (rooms.length === 0) {
                roomList.innerHTML = "<li>No rooms found.</li>";
                return;
            }

            rooms.forEach(room => {
                const li = document.createElement("li");
                li.textContent = `Room ID: ${room.room_id} - ${room.name}`;
                li.dataset.roomId = room.room_id;
                li.addEventListener("click", () => {
                    loadRoomUsers(room.room_id);
                    loadRoomTasks(room.room_id);
                });
                roomList.appendChild(li);
            });
        } catch (error) {
            console.error("Failed to load rooms", error);
            roomList.innerHTML = "<li>Error loading rooms.</li>";
        }
    }

    async function loadRoomUsers(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_users/${roomId}`);
            if (!response.ok) throw new Error("Failed to load room users");

            const users = await response.json();
            userList.innerHTML = ""; // ユーザー一覧をクリア

            if (users.length === 0) {
                userList.innerHTML = "<li>No users in this room.</li>";
                return;
            }

            users.forEach(user => {
                const li = document.createElement("li");
                li.textContent = `${user.name} (ID: ${user.user_id})`;
                userList.appendChild(li);
            });
        } catch (error) {
            console.error("Failed to load room users", error);
            userList.innerHTML = "<li>Error loading users.</li>";
        }
    }

    async function loadRoomTasks(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_tasks/${roomId}`);
            if (!response.ok) throw new Error("Failed to load room tasks");

            const tasks = await response.json();
            taskList.innerHTML = ""; // タスク一覧をクリア

            if (tasks.length === 0) {
                taskList.innerHTML = "<li>No tasks found for this room.</li>";
                return;
            }

            function renderTask(task, indent = 0) {
                const li = document.createElement("li");
                li.textContent = `${" ".repeat(indent * 2)} ${task.target} (Status: ${task.status ? "✅" : "❌"})`;
                taskList.appendChild(li);
                if (task.subtasks) {
                    task.subtasks.forEach(subtask => renderTask(subtask, indent + 1));
                }
            }

            tasks.forEach(task => renderTask(task));
        } catch (error) {
            console.error("Failed to load room tasks", error);
            taskList.innerHTML = "<li>Error loading tasks.</li>";
        }
    }

    loadRooms();
});
