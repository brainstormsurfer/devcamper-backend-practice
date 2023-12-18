// Authentication
import ErrorResponse from "./../utils/errorResponse.js";
import asyncHandler from "./../middleware/async.js";
import User from "./../models/User.js";
import { sendEmail } from "./../utils/sendEmail.js";
import crypto from "node:crypto";

// @desc    Register user
// @router  GET /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Create user (from the model static function - create)
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Create token - (lowercase user because we're using method, not static which we get from the Model.) and this is how we get the access with this method in the Schema (UserSchema.methods.getSignedJwtToken)
  const token = user.getSignedJwtToken();

  res.status(200).json({ success: true, token });
});

// @desc    Login user
// @router  POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  // Check if password matches (the entered password comes from "body")
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);

  // Create token (Early version before the cookie-parser mechanism,
  // and sending the token with a cookie within) :
  // const token = user.getSignedJwtToken();
  // res.status(200).json({ success: true, token });
});

// (a route to -)
// @desc    GET current logged in user
// @router  POST /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user details
// @router  PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update password
// @router  PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  console.log("PUT user", user)
  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc    Forget Password
// @router  POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has
  requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res.status(200).json({ success: true, data: "Email sent" });
  } catch (err) {
    console.log(err);
    // Temporary in DB, and only for the purpose of resetting -
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

// @desc    Reset Password
// @router  POST /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  // when we set a field to undefined - it just "goes away"
  user.resetPasswordToken = undefined; // (*get encrypted in User middleware while "if (!this.isModified('password')"" WON'T fire off due to the password modification)
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    // A great mistake:
    // I accidentally wrote "expires" without an 's', different from Brad's "expires", and probably could never guess that this is the reason that the server refuse to work. (apparently, syntax has changed)
    expire: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    // we only want the cookie to be access through the client-side's script so -
    httpOnly: true,
  };

  // securing our cookie with edit the secure flag to true ("https") for production mode
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // we send a token back in the response (key/name-of token + token)
  // we also sending a cookie
  // and it's really up to the client-side how they want to handle it:
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

export { register, login, getMe, forgotPassword, resetPassword, updateDetails, updatePassword };
