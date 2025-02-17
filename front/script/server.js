const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8000;

// MySQL接続
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'goals_db',
    port: 3306
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL Connected...');
});

app.use(cors());
app.use(bodyParser.json());

// ユーザー登録エンドポイント（必要に応じて追加）
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    db.query(query, [username, email, password], (err, result) => {
        if (err) throw err;
        res.send({ success: true, userId: result.insertId });
    });
});

// ログインエンドポイント
app.post('/api/login', (req, res) => {
    const { username, email, password } = req.body;
    const query = 'SELECT id FROM users WHERE username = ? AND email = ? AND password = ?';
    db.query(query, [username, email, password], (err, results) => {
        if (err) throw err;
        if (results.length > 0) {
            res.send({ success: true, userId: results[0].id });
        } else {
            res.send({ success: false });
        }
    });
});

// 目標を保存するエンドポイント
app.post('/api/goals', (req, res) => {
    const { userId, goal } = req.body;
    const query = 'INSERT INTO goals (user_id, goal) VALUES (?, ?)';
    db.query(query, [userId, goal], (err, result) => {
        if (err) throw err;
        res.send({ id: result.insertId, userId, goal });
    });
});

// 目標を取得するエンドポイント
app.get('/api/goals/:userId', (req, res) => {
    const { userId } = req.params;
    const query = 'SELECT * FROM goals WHERE user_id = ?';
    db.query(query, [userId], (err, results) => {
        if (err) throw err;
        res.send(results);
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});