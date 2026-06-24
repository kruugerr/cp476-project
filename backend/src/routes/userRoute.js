import express from "express";
import * as userController from "../controllers/userController.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

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
