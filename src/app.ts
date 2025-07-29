import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Routes and Middlewares
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notfound } from "./app/middleware/not-found";
import {
  corsConfigure,
  doubleCsrfProtection,
  limiter,
} from "./utils/middleware-configure";
import { AppointmentService } from "./app/modules/Appointment/appointment.service";
import cron from "node-cron";

const app: Application = express();

// Security Middleware
app.use(helmet());
app.use(cors(corsConfigure));
// app.use(limiter);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(doubleCsrfProtection);

// Routes
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "🚀 Healthcare Server is running!",
  });
});

app.use("/api/v1", router);

// Cron Job
cron.schedule("* * * * *", () => {
  try {
    AppointmentService.cancelUnpaidAppointments();
  } catch (error) {
    console.error(error);
  }
});

// Error Handling
app.use(notfound);
app.use(globalErrorHandler);

// Export for Vercel
export default app;
