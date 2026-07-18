import pool from "../config/db.js";

export const getAllUsers = (callback) => {
    const query = `
        SELECT user_id, first_name, last_name, email, role
        FROM users
    `;
    pool.query(query, callback);
};

export const getUserById = (userId, callback) => {
    const query = `
        SELECT user_id, first_name, last_name, email, role
        FROM users
        WHERE user_id = ?
    `;
    pool.query(query, [userId], callback);
};

export const getAllCourses = (callback) => {
    pool.query("SELECT * FROM courses", callback);
};

export const getCourseById = (courseId, callback) => {
    pool.query(
        "SELECT * FROM courses WHERE course_id = ?",
        [courseId],
        callback,
    );
};

export const getStatistics = (callback) => {
    const query = `
        SELECT
            (SELECT COUNT(*) FROM users WHERE role = 'student') AS total_students,
            (SELECT COUNT(*) FROM courses) AS total_courses,
            (SELECT COUNT(*) FROM activities) AS total_activities
    `;
    pool.query(query, callback);
};

export const getAllActivities = (callback) => {
    pool.query("SELECT * FROM activities", callback);
};
