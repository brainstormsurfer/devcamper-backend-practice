import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import colors from "colors";
// Security Middlewares
import { configureXssMiddleware } from "./middleware/configureXssMiddleware.js";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import cors from "cors";


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

app.use((req, res, next) => {
  // Step 1: Generate a Nonce
  const nonce = crypto.randomBytes(16).toString('base64');

  // Step 2: Assign Nonce to Inline Scripts
  res.locals.nonce = nonce;

  // Step 3: Update Content Security Policy
  res.setHeader('Content-Security-Policy', `script-src 'self' 'nonce-${nonce}'`);
  
  next();
});

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

// Rate limiting    (status code: 429 - too many requests)
const limiter = rateLimit({
  // 100 requests per 10 mins
  windowMs: 10 * 60 * 1000, 
  max: 100,
  trustProxy: 1,
});
app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors())


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

app.set('trust proxy', 1);

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
