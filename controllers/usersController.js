// Authentication
import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/User.js";

// @desc    Get all users
// @router  GET /api/v1/auth/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => { 
    res.status(200).json(res.advancedResults);
  });
  

// @desc    Get single user
// @router  GET api/v1/auth/user/:id
// @access  Private/Admin
const getUser = asyncHandler(async (req, res, next) => {  
    const user = await User.findById(req.params.id)

    res.status(200).json({
        success: true,
        data: user
    })
  });
  

// @desc    Create user
// @router  POST /api/v1/auth/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {  
    const user = await User.create(req.body)
    // response with 201 for creating a resource
    res.status(201).json({
        success: true,
        data: user
    })
  });
  

// @desc    Update user
// @router  PUT /api/v1/auth/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {  
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
    })
    res.status(200).json({
        success: true,
        data: user
    })
  });
  

// @desc    Delete user
// @router  DELETE /api/v1/auth/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {  
    await User.findOneAndDelete(req.params.id)

    res.status(200).json({
        success: true,
        data: {}
    })
  });
  
  export {getUsers, getUser, createUser, updateUser, deleteUser}