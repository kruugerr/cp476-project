import express from "express";
import * as userController from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Every route below this line requires a valid JWT.
// verifyToken attaches req.user = { user_id, role } from the token,
// so controllers should use req.user.user_id instead of trusting
// req.body.userId or req.params.id from the client.
router.use(verifyToken);

// Dashboard page routes
router.get("/courses", userController.getCoursesByUserId);
router.get("/activities", userController.getActivitiesByUserId);
router.get("/statistics", userController.getStatisticsByUserId);

// Courses page + Calendar + GPA routes
router.get("/courses/:courseId", userController.getCourseById);
router.get(
    "/courses/:courseId/activities",
    userController.getActivitiesByUserIdAndCourseId,
);

// Upload syllabus routes + add course and activity routes
router.post(
    "/upload-syllabus",
    upload.single("file"),
    userController.uploadSyllabus,
);
router.post("/courses/", userController.addCourse);

// Profile page routes
router.get("/:id/profile", userController.getProfileById);
router.put("/:id/profile", userController.updateProfileById);

export default router;