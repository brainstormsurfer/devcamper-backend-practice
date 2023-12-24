import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";

// Security Middlewares
import {configureXssMiddleware} from './middleware/configureXssMiddleware.js'
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";

import colors from "colors";
import fileUpload from "express-fileupload";
import errorHandler from "./middleware/errorHandler.js";
import connectDB from "./config/db.js";

// Route files
import bootcamps from "./routes/bootcampsRoutes.js";
import courses from "./routes/coursesRoutes.js";
import auth from "./routes/authRoutes.js";
import users from "./routes/usersRoutes.js";
import reviews from "./routes/reviewsRoutes.js";

//Load env vars (due to configuration in a separate file (e.g., config.env), we should specify the path when calling dotenv.config():
dotenv.config({ path: "config/config.env" });

// Connect to database
connectDB();

const app = express();

//Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// File uploading (such as a photo for a bootcamp)
app.use(fileUpload());

// --- Security Middlewares ----

// Prevent XSS attacks
app.use(configureXssMiddleware());

// Sanitize Data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// -------------------------------

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use("/api/v1/users", users);
app.use("/api/v1/reviews", reviews);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
);

// Mongoose connection error handler
// mongoose.connection.on("error", (err) => {
//   console.error(`Error: ${err.message}`.red);
// Close server & exit process
//   server.close(() => process.exit(1));
// });

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  // Close server & exit process
  server.close(() => process.exit(1));
});
