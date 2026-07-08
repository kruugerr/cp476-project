import db from "../config/db.js";

export const getAllUsers = (callback) => {
    const query = "SELECT * FROM users";
    db.query(query, (err, results) => {
        if (err) {
            console.error("Error fetching users:", err);
            return callback(err, null);
        }
        callback(null, results);
    });
};

export const getUserByEmail = (email, callback) => {
    const query = "SELECT * FROM users WHERE email = ?";
    db.query(query, [email], (err, results) => {
        if (err) {
            console.error("Error fetching user by email:", err);
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};

export const createUser = (userData, callback) => {
    const { first_name, last_name, email, password_hash, role } = userData;
    const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(query, [first_name, last_name, email, password_hash, role || "student"], (err, results) => {
        if (err) {
            console.error("Error creating user:", err);
            return callback(err, null);
        }
        callback(null, { user_id: results.insertId, first_name, last_name, email, role: role || "student" });
    });
};

export const getUserById = (userId, callback) => {
    const query = "SELECT * FROM users WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching user by ID:", err);
            return callback(err, null);
        }
        callback(null, results[0]);
    });
};