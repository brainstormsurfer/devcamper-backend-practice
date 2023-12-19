import express from "express";

import {
  getReviews,
  getReview,
  addReview,
  updateReview,
  deleteReview,
} from "../controllers/reviewsController.js";

import Review from "../models/Review.js";

// Merged documentation: Preserve the req.params values from the parent router. 
// If the parent and the child have conflicting param names, the child’s value take precedence.  
// @default false
const router = express.Router({ mergeParams: true });

import { advancedResults } from "../middleware/advancedResults.js";
import { authorize, protect } from "../middleware/authMiddleware.js";

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  ).post(protect, authorize("user", "admin"), addReview);

router.route("/:id").get(getReview);
//   .put(protect, authorize('publisher', 'admin'), updateReview)
//   .delete(protect, authorize('publisher', 'admin'), deleteReview);

export default router;
