import express from "express";

import {
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse,
} from "../controllers/coursesController.js";

import Course from "../models/Course.js";

// Docs of merged: Preserve the req.params values from the parent router. If the parent and the child have conflicting param names, the child’s value take precedence.  @default false
const router = express.Router({ mergeParams: true });

import { advancedResults } from "../middleware/advancedResults.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(protect, addCourse);

router
  .route("/:id")
  .get(getCourse)
  .put(protect, authorize('publisher', 'admin'), updateCourse)
  .delete(protect, authorize('publisher', 'admin'), deleteCourse);

export default router;
