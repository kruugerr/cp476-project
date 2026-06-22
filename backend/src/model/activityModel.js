import db from "../config/db.js";

export const getAllActivities = (userId, callback) => {
    const query = "SELECT * FROM activities WHERE user_id = ?";
    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Error fetching activities:", err);
            callback(err, null);
        } else {
            callback(null, results);
        }
    });
};
