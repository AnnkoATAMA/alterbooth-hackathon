document.addEventListener("DOMContentLoaded", function () {
    const createGroupForm = document.getElementById("createGroupForm");
    const addUserForm = document.getElementById("addUserForm");
    const responseMessage = document.getElementById("responseMessage");
    const userSelect = document.getElementById("userSelect");
    const roomList = document.getElementById("roomList");
    const userList = document.getElementById("userList");
    const taskList = document.getElementById("taskList");

    let userId = null;

    /** 認証情報を取得 */
    async function getUserId() {
        try {
            const response = await fetch("http://localhost:8000/api/auth/check-auth", { method: "GET", credentials: "include" });
            if (!response.ok) throw new Error("Unauthorized");
            const data = await response.json();
            userId = data.userId;
        } catch (error) {
            console.error("Failed to get user ID", error);
            responseMessage.textContent = "User authentication failed.";
            userId = null;
        }
    }

    async function loadRooms() {
        try {
            const response = await fetch("http://localhost:8000/api/room/my_rooms");
            if (!response.ok) throw new Error("Failed to load rooms");

            let rooms = await response.json();
            console.log("Fetched Rooms:", rooms);  // API が正しく動いているか確認

            // ルームIDの重複を削除
            const uniqueRooms = Array.from(new Map(rooms.map(room => [room.room_id, room])).values());

            // リストをクリア
            roomList.innerHTML = "";

            if (uniqueRooms.length === 0) {
                roomList.innerHTML = "<li>No rooms found.</li>";
                return;
            }

            uniqueRooms.forEach(room => {
                const li = document.createElement("li");
                li.textContent = `Room ID: ${room.room_id} - ${room.name}`;
                li.dataset.roomId = String(room.room_id);
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



    /** すべてのユーザー一覧を取得 */
    async function loadUsers() {
        try {
            const response = await fetch("http://localhost:8000/api/user/get");
            if (!response.ok) throw new Error("Failed to load users");

            const users = await response.json();
            userSelect.innerHTML = users.length === 0 ? "<option value=''>No users available</option>" : "";

            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.user_id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Failed to load users", error);
            userSelect.innerHTML = "<option value=''>Error loading users</option>";
        }
    }

    /** ルーム内のユーザーを取得し表示 */
    async function loadRoomUsers(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_users/${roomId}`);
            if (!response.ok) throw new Error("Failed to load room users");

            const users = await response.json();
            userList.innerHTML = users.length === 0 ? "<li>No users in this room.</li>" : "";

            users.forEach(user => {
                const li = document.createElement("li");
                li.textContent = user.name;
                userList.appendChild(li);
            });
        } catch (error) {
            console.error("Failed to load room users", error);
            userList.innerHTML = "<li>Error loading users.</li>";
        }
    }

    /** ルーム内のタスクを取得し表示 */
    async function loadRoomTasks(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_tasks/${roomId}`);
            if (!response.ok) throw new Error("Failed to load room tasks");

            const tasks = await response.json();
            taskList.innerHTML = tasks.length === 0 ? "<li>No tasks found for this room.</li>" : "";

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

    /** グループ作成処理 */
    createGroupForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        await getUserId();

        if (!userId) {
            responseMessage.textContent = "User authentication required.";
            return;
        }

        const groupName = document.getElementById("groupName").value;

        try {
            const response = await fetch("http://localhost:8000/api/room/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: groupName, user_id: userId }),
            });

            if (!response.ok) throw new Error("Failed to create group");
            const data = await response.json();

            responseMessage.textContent = `Group created successfully! ID: ${data.groupId}`;
            await loadRooms();
        } catch (error) {
            responseMessage.textContent = "Failed to create group.";
        }
    });

    /** ルームにユーザーを追加 */
    addUserForm.addEventListener("submit", async function (event) {
        event.preventDefault();
        const roomId = document.getElementById("roomId").value;
        const selectedUserId = userSelect.value;

        if (!selectedUserId) {
            responseMessage.textContent = "Please select a user.";
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/api/room/add_user", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ room_id: parseInt(roomId), user_id: parseInt(selectedUserId) }),
            });

            if (!response.ok) throw new Error("Failed to add user to group");
            responseMessage.textContent = "User added to group successfully!";
            await loadRooms();
        } catch (error) {
            responseMessage.textContent = "Failed to add user to group.";
        }
    });

    // 初期データ取得
    loadUsers();
    loadRooms();
});
