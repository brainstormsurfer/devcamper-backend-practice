import express from "express";

import {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} from "../controllers/bootcampsController.js";

import Bootcamp from "../models/Bootcamp.js";

// Include other courses routers
import coursesRouter from "./coursesRoutes.js";
import reviewsRouter from "./reviewsRoutes.js";

const router = express.Router();

import {advancedResults} from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

// Re-route into other resource routers
router.use("/:bootcampId/courses", coursesRouter);
router.use("/:bootcampId/reviews", reviewsRouter);
    // getting courses/reviews for a specific bootcamp (not using advanced results
    // via Bootcamp's reverse populate with virtuals,
    // And via the {mergeParams: true} reviewsRouter property

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

router.route("/:id/photo").put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route("/:id")
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

export default router;
