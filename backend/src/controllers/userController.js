import * as userModel from "../model/userModel.js";
import * as courseModel from "../model/courseModel.js";
import * as activityModel from "../model/activityModel.js";
import { extractSyllabus } from "../services/extractor.js";
import { normalizeExtraction, validateCoursePayload,} from "../services/syllabusNormalizer.js";

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
export const uploadSyllabus = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    const { term, term_start, term_end } = req.body;
    console.log(
        "Extracting syllabus:",
        req.file.originalname,
        req.file.size,
        "bytes | term:",
        term,
    );

    try {
        const raw = await extractSyllabus({
            pdfBuffer: req.file.buffer,
            term,
            term_start,
            term_end,
        });
        const result = normalizeExtraction(raw, { term });
        res.status(200).json(result);
    } catch (err) {
        console.error("Syllabus extraction failed:", err.message);
        res.status(502).json({ message: "Extraction failed. Please try again." });
    }
};

// POST /user/courses
// Creates a course and, if provided, its activities in one call — this is
// what runs after the student reviews/confirms extracted syllabus data,
// or adds a course manually.
export const addCourse = (req, res) => {
    // Strict server-side validation/normalization.
    const { ok, errors, normalized } = validateCoursePayload(req.body);
    if (!ok) {
        return res.status(400).json({ message: "Invalid course data", errors });
    }
    const { course, activities } = normalized;

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
