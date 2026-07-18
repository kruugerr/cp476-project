import * as adminModel from "../model/adminModel.js";

export const getAllUsers = (req, res) => {
    adminModel.getAllUsers((err, users) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(users);
    });
};

export const getUser = (req, res) => {
    adminModel.getUserById(req.params.id, (err, users) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!users[0]) return res.status(404).json({ message: "User not found" });
        res.json(users[0]);
    });
};

export const getAllCourses = (req, res) => {
    adminModel.getAllCourses((err, courses) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(courses);
    });
};

export const getCourse = (req, res) => {
    adminModel.getCourseById(req.params.id, (err, courses) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!courses[0]) return res.status(404).json({ message: "Course not found" });
        res.json(courses[0]);
    });
};

export const getStatistics = (req, res) => {
    adminModel.getStatistics((err, statistics) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(statistics[0]);
    });
};

export const getAllUserActivities = (req, res) => {
    adminModel.getAllActivities((err, activities) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(activities);
    });
};
