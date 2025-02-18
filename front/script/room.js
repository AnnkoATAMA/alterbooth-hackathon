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
            if (!response.ok) throw new Error("認証エラー");

            const data = await response.json();
            userId = data.userId;
            return userId;  // ✅ ここで userId を戻り値として返す
        } catch (error) {
            console.error("ユーザーIDの取得に失敗しました", error);
            responseMessage.textContent = "ユーザー認証に失敗しました。";
            return null;  // ✅ エラー時に null を返す
        }
    }

    /** ルーム一覧を取得し表示 */
    async function loadRooms() {
        try {
            const response = await fetch("http://localhost:8000/api/room/my_rooms");
            if (!response.ok) throw new Error("ルームの取得に失敗しました");

            let rooms = await response.json();
            console.log("取得したルーム:", rooms);

            // ルームIDの重複を削除
            const uniqueRooms = Array.from(new Map(rooms.map(room => [room.room_id, room])).values());

            roomList.innerHTML = ""; // リストをクリア

            if (uniqueRooms.length === 0) {
                roomList.innerHTML = "<li>ルームがありません。</li>";
                return;
            }

            uniqueRooms.forEach(room => {
                const li = document.createElement("li");
                li.textContent = `ルームID: ${room.room_id} - ${room.name}`;
                li.dataset.roomId = String(room.room_id);
                li.addEventListener("click", () => {
                    loadRoomUsers(room.room_id);
                    loadRoomTasks(room.room_id);
                });
                roomList.appendChild(li);
            });

        } catch (error) {
            console.error("ルームの取得に失敗しました", error);
            roomList.innerHTML = "<li>ルームの読み込みエラー。</li>";
        }
    }

    /** すべてのユーザー一覧を取得 */
    async function loadUsers() {
        try {
            const response = await fetch("http://localhost:8000/api/user/get");
            if (!response.ok) throw new Error("ユーザー一覧の取得に失敗しました");

            const users = await response.json();
            userSelect.innerHTML = users.length === 0 ? "<option value=''>ユーザーがいません</option>" : "";

            users.forEach(user => {
                const option = document.createElement("option");
                option.value = user.user_id;
                option.textContent = user.name;
                userSelect.appendChild(option);
            });
        } catch (error) {
            console.error("ユーザーの取得に失敗しました", error);
            userSelect.innerHTML = "<option value=''>ユーザーの読み込みエラー</option>";
        }
    }

    /** ルーム内のユーザーを取得し表示 */
    async function loadRoomUsers(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_users/${roomId}`);
            if (!response.ok) throw new Error("ルーム内のユーザー取得に失敗しました");

            const users = await response.json();
            userList.innerHTML = users.length === 0 ? "<li>このルームにはユーザーがいません。</li>" : "";

            users.forEach(user => {
                const li = document.createElement("li");
                li.textContent = user.name;
                userList.appendChild(li);
            });
        } catch (error) {
            console.error("ルーム内のユーザーの取得に失敗しました", error);
            userList.innerHTML = "<li>ユーザーの読み込みエラー。</li>";
        }
    }

    /** ルーム内のタスクを取得し表示 */
    async function loadRoomTasks(roomId) {
        try {
            const response = await fetch(`http://localhost:8000/api/room/room_tasks/${roomId}`);
            if (!response.ok) throw new Error("タスクの取得に失敗しました");

            const tasks = await response.json();
            taskList.innerHTML = tasks.length === 0 ? "<li>このルームにはタスクがありません。</li>" : "";

            function renderTask(task, indent = 0) {
                const li = document.createElement("li");
                li.textContent = `${" ".repeat(indent * 2)} ${task.target} (状態: ${task.status ? "✅ 達成済" : "❌ 未達成"})`;
                taskList.appendChild(li);
                if (task.subtasks) {
                    task.subtasks.forEach(subtask => renderTask(subtask, indent + 1));
                }
            }

            tasks.forEach(task => renderTask(task));
        } catch (error) {
            console.error("タスクの取得に失敗しました", error);
            taskList.innerHTML = "<li>タスクの読み込みエラー。</li>";
        }
    }

    // 初期データ取得
    loadUsers();
    loadRooms();
});
