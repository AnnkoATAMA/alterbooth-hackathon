DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS target;
DROP TABLE IF EXISTS rooms;
DROP TABLE IF EXISTS group_user;

CREATE TABLE users(
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE target(
    target_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    target VARCHAR(255) NOT NULL,
    status BOOLEAN NOT NULL DEFAULT FALSE,
    weight INT NOT NULL DEFAULT 1,
    parent_id INT DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_target_user FOREIGN KEY (user_id) REFERENCES users(user_id),
    CONSTRAINT fk_target_parent FOREIGN KEY (parent_id) REFERENCES target(target_id) ON DELETE CASCADE
);

CREATE TABLE rooms(
    room_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE room_user(
    room_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (room_id, user_id),
    CONSTRAINT fk_room_user_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT fk_room_user_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);


INSERT INTO users (user_id, name, email, password, created_at, updated_at)
VALUES 
(1, 'aaa', 'a@gmail.com', 'password', '2024-02-11 00:00:00', '2024-09-11 00:00:00'),
(2, 'bbb', 'b@gmail.com', 'password', '2024-02-11 00:00:00', '2024-09-11 00:00:00'),
(3, 'ccc', 'c@gmail.com', 'password', '2024-02-11 00:00:00', '2024-09-11 00:00:00');