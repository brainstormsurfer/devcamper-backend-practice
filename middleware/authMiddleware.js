import jwt from "jsonwebtoken";
import asyncHandler from "./asyncHandler.js";
import ErrorResponse from "../utils/errorResponse.js";
import User from "../models/User.js";

// Product routes
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization?.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; }  
  // (by choosing a connection with a cookie - we may disabled the Auth Bearer alternative)
  //  else if (req.cookies.token) {    
  //   token = req.cookies.token
  // }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    // decoded has (user) id property from the token,
    // so we got the user (next line) and put it in req.user,
    // which will be available for us in any protected route.
    // - In every route which we use this middleware we'll have access to req.user
    // in any of the user fields.

    // AND if the *protect middleware* won't be defined in the auth route - 
    // then we won't have access to the req.user.
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    //! we get req.user EARLIER (order matters!) in the protect middleware
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          401
        )
      );
    }

    next();
  };
};

export {
  protect,
  authorize
}
