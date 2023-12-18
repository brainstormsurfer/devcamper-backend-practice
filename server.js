import path from "path";
import { fileURLToPath } from "url";

import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import colors from "colors";
import fileUpload from "express-fileupload";
import errorHandler from "./middleware/error.js";
import connectDB from "./config/db.js";

//Load env vars (due to configuration in a separate file (e.g., config.env), we should specify the path when calling dotenv.config():
dotenv.config({ path: "config/config.env" });

// Connect to database
connectDB();

// Route files
import bootcamps from "./routes/bootcamps.js";
import courses from "./routes/courses.js";
import auth from "./routes/auth.js";

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

// Set static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Mount routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
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
