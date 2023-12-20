import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Review from "../models/Review.js";
import Bootcamp from "../models/Bootcamp.js";

// @desc    Get all reviews
// @route   GET /api/v1/reviews
// @route   GET /api/v1/bootcamps/:bootcampId/reviews
// @access  Public
const getReviews = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const reviews = await Review.find({ bootcamp: req.params.bootcampId });

    // getting reviews for a specific bootcamp (not using advanced results)
    // via Bootcamp's reverse populate with virtuals,
    // And via the {mergeParams: true} reviewsRouter property
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc    Get single review
// @route   GET /api/v1/reviews/:id
// @access  Public
const getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!review) {
    return next(
      // if it is formatted object id but not in db
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: review });
});

// (preparation: Course is/as  Bootcamp's virtual field/attribute)
// @desc    Add review
// @route   POST /api/v1/bootcamps/:bootcampId/reviews
// @access  Private
const addReview = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; 
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  const review = await Review.create(req.body);
  res.status(201).json({ success: true, data: review });
});

// @desc    Update review
// @route   PUT /api/v1/reviews/:id
// @access  Private
const updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is review provider
  // if (review.user.toString() !== req.user.id || req.user.role === "publisher") {
  if (review.user.toString() !== req.user.id && req.user.role ==! "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to update review ${review._id}`
      ),
      401
    );
  }
  
  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  await review.save(); // triggers the post middleware 
  res.status(201).json({ success: true, data: review });
});

// @desc    Delete review
// @route   DELETE /api/v1/reviews/:id
// @access  Private
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`),
      404
    );
  }

  // Make sure user is review owner
  // if (review.user.toString() !== req.user.id || req.user.role === "publisher") {
    if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to delete review ${review._id}`
      ),
      404
    );
  }

  await review.deleteOne();
  res.status(201).json({ success: true, data: {} });
});

export { getReviews, getReview, addReview, updateReview, deleteReview };
