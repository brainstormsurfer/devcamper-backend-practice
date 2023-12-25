import express from "express";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/usersController.js";

import User from "../models/User.js";


import { advancedResults }  from "../middleware/advancedResults.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router({ mergeParams: true });

// any route below those middlewares is protected, and requires to be an admin
router.use(protect);
router.use(authorize("admin"));

// advancedResults takes a model (and a populate which we don't need here)
router.route("/").get(advancedResults(User), getUsers).post(createUser);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

export default router;
