import * as userModel from "../model/userModel.js";
import * as courseModel from "../model/courseModel.js";
import * as activityModel from "../model/activityModel.js";

// GET /user/courses
// req.user comes from verifyToken middleware — this is the trustworthy
// source of "who is asking", not req.body or req.params.
export const getCoursesByUserId = (req, res) => {
    courseModel.getCoursesByUserId(req.user.user_id, (err, courses) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(courses);
    });
};

// GET /user/activities
export const getActivitiesByUserId = (req, res) => {
    activityModel.getAllActivities(req.user.user_id, (err, activities) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(activities);
    });
};

// GET /user/statistics
export const getStatisticsByUserId = (req, res) => {
    activityModel.getStatisticsByUserId(req.user.user_id, (err, stats) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(stats);
    });
};

// GET /user/courses/:courseId
export const getCourseById = (req, res) => {
    const { courseId } = req.params;
    courseModel.getCourseById(courseId, req.user.user_id, (err, course) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!course) return res.status(404).json({ message: "Course not found" });
        res.json(course);
    });
};

// GET /user/courses/:courseId/activities
export const getActivitiesByUserIdAndCourseId = (req, res) => {
    const { courseId } = req.params;
    activityModel.getActivitiesByCourseId(courseId, req.user.user_id, (err, activities) => {
        if (err) return res.status(500).json({ message: "Server error" });
        res.json(activities);
    });
};

// POST /user/upload-syllabus
// Still a stub — the actual PDF parsing/extraction logic is Phase 4 work.
// This just confirms the file made it through multer for now.
export const uploadSyllabus = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("Received syllabus:", req.file.originalname, req.file.size, "bytes");
    res.status(202).json({ message: "File received, extraction not yet implemented" });
};

// POST /user/courses
// Creates a course and, if provided, its activities in one call — this is
// what runs after the student reviews/confirms extracted syllabus data,
// or adds a course manually.
export const addCourse = (req, res) => {
    const { course, activities } = req.body;

    if (!course || !course.course_code || !course.course_name || !course.term) {
        return res.status(400).json({ message: "Missing required course fields" });
    }

    courseModel.createCourse(req.user.user_id, course, (err, newCourse) => {
        if (err) return res.status(500).json({ message: "Failed to create course" });

        if (!activities || activities.length === 0) {
            return res.status(201).json({ course: newCourse, activities: [] });
        }

        // Insert each activity sequentially under the new course.
        // Note: this isn't wrapped in a DB transaction, so if one insert
        // fails partway through, earlier ones already succeeded. Fine for
        // now — worth revisiting with a transaction once this is tested
        // against real data.
        const createdActivities = [];
        let remaining = activities.length;
        let hadError = false;

        activities.forEach((activity) => {
            activityModel.createActivity(newCourse.course_id, activity, (err, newActivity) => {
                remaining -= 1;
                if (err) {
                    hadError = true;
                } else {
                    createdActivities.push(newActivity);
                }

                if (remaining === 0) {
                    if (hadError) {
                        return res.status(207).json({
                            message: "Course created, some activities failed",
                            course: newCourse,
                            activities: createdActivities,
                        });
                    }
                    res.status(201).json({ course: newCourse, activities: createdActivities });
                }
            });
        });
    });
};

// GET /user/:id/profile
// Ownership check: a user can only view their own profile through this
// route. (Admins get their own separate routes in adminController.js.)
export const getProfileById = (req, res) => {
    const { id } = req.params;

    if (Number(id) !== req.user.user_id) {
        return res.status(403).json({ message: "Not authorized to view this profile" });
    }

    userModel.getUserById(id, (err, user) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (!user) return res.status(404).json({ message: "User not found" });

        const { password_hash, ...safeUser } = user;
        res.json(safeUser);
    });
};

// PUT /user/:id/profile
export const updateProfileById = (req, res) => {
    const { id } = req.params;

    if (Number(id) !== req.user.user_id) {
        return res.status(403).json({ message: "Not authorized to edit this profile" });
    }

    const { profile } = req.body;
    if (!profile) {
        return res.status(400).json({ message: "Missing profile data" });
    }

    userModel.updateUser(id, profile, (err, updatedUser) => {
        if (err) return res.status(500).json({ message: "Failed to update profile" });
        res.json(updatedUser);
    });
};