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

export const createUser = (userData, callback) => {
    const { first_name, last_name, email, password_hash, role } = userData;
    const query = `
        INSERT INTO users (first_name, last_name, email, password_hash, role)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(
        query,
        [first_name, last_name, email, password_hash, role || "student"],
        (err, results) => {
            if (err) {
                console.error("Error creating user:", err);
                return callback(err, null);
            }
            callback(null, {
                user_id: results.insertId,
                first_name,
                last_name,
                email,
                role: role || "student",
            });
        }
    );
};

// Updates editable profile fields only — email/password/role are
// intentionally excluded here; those need their own dedicated flows
// (password reset, email change with re-verification, admin-only role
// changes) rather than being editable through a general profile update.
export const updateUser = (userId, profileData, callback) => {
    const {
        first_name,
        last_name,
        institution,
        theme_mode,
        preferred_gpa_scale,
        default_reminder_days,
        default_reminder_method,
    } = profileData;

    const query = `
        UPDATE users
        SET first_name = ?, last_name = ?, institution = ?, theme_mode = ?,
            preferred_gpa_scale = ?, default_reminder_days = ?, default_reminder_method = ?
        WHERE user_id = ?
    `;

    db.query(
        query,
        [
            first_name,
            last_name,
            institution || null,
            theme_mode || "light",
            preferred_gpa_scale || 12.0,
            default_reminder_days || 3,
            default_reminder_method || "email",
            userId,
        ],
        (err, results) => {
            if (err) {
                console.error("Error updating user:", err);
                return callback(err, null);
            }
            callback(null, { user_id: userId, ...profileData });
        }
    );
};