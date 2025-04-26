import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import router from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import httpStatus from "http-status";
import { notfound } from "./app/middleware/not-found";

const app: Application = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send({
    message: "Health care server",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);
app.use(notfound);

export default app;
