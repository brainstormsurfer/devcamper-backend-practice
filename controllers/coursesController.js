import ErrorResponse from "../utils/errorResponse.js";
import asyncHandler from "../middleware/asyncHandler.js";
import Course from "../models/Course.js";
import Bootcamp from "../models/Bootcamp.js";

// @desc    Get all courses
// @route   GET /api/v1/courses
// @route   GET /api/v1/bootcamps/:bootcampId/courses
// @access  Public
const getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({ bootcamp: req.params.bootcampId });

    // getting courses for a specific bootcamp (not using advanced results)
    // via Bootcamp's reverse populate with virtuals,
    // And via the {mergeParams: true} reviewsRouter property
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    // getting all courses
    res.status(200).json(res.advancedResults);
    // now when we get all courses we can implement pagination and all the advanced commands
  }
});

// @desc    Get single course
// @route   GET /api/v1/courses/:id
// @access  Public
const getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      // if it is formatted object id but not in db
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({ success: true, data: course });
});

// (preparation: Course is/as  Bootcamp's virtual field/attribute)
// @desc    Add course
// @route   POST /api/v1/bootcamps/:bootcampId/courses
// @access  Private
const addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId; 
  req.body.user = req.user.id; 

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`),
      404
    );
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to add a course to bootcamp ${bootcamp._id}`
      ),
      401
    );
  }
  const course = await Course.create(req.body);

  res.status(201).json({ success: true, data: course });
});

// @desc    Update course
// @route   PUT /api/v1/courses/:id
// @access  Private
const updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

 // Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorize to update course ${course._id}`
      ),
      401
    );
  }

  course = await Course.findByIdAndUpdate({_id: req.params.id}, req.body, {
    //options
    new: true,
    runValidators: true,
  });

  res.status(201).json({ success: true, data: course });
});

// @desc    Delete course
// @route   DELETE /api/v1/courses/:id
// @access  Private
const deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`),
      404
    );
  }

 // Make sure user is bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(`User ${req.user.id} is not authorize to delete course ${course._id}`),
      404
    );
  }

  await course.deleteOne()
  res.status(201).json({ success: true, data: {} });
});

export { getCourses, getCourse, addCourse, updateCourse, deleteCourse };
