import express, { Application, Request, Response } from "express";
import cors from "cors";

// Routes and Middlewares
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notfound } from "./app/middleware/not-found";

const app: Application = express();

// Middleware: Parse JSON and URL Encoded Data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "🚀 Healthcare Server is running!",
  });
});

// Application Routes
app.use("/api/v1", router);

// Global Error Handler
app.use(globalErrorHandler);

// Handle Not Found Routes
app.use(notfound);

export default app;
