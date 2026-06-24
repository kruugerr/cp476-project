import db from "../config/db.js";

export const getAllUsers = (callback) => {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
};

export const getUserByUsername = (username, callback) => {
    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
        if (err) {
            console.error("Error fetching user by username:", err);
            callback(err, null);
        } else {
            callback(null, results[0]);
        }
    });
};