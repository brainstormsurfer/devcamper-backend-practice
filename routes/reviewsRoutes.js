import express from "express";

import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

import Review from "../models/Review.js";

import { advancedResults } from "../middleware/advancedResults.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

// Merged documentation: Preserve the req.params values from the parent router. 
// If the parent and the child have conflicting param names, the child’s value take precedence.  
// @default false
const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  ).post(protect, authorize("user", "admin"), addReview);

router.route("/:id").get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

export default router;
