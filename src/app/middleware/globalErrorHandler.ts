import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AppError from "../../shared/appError";
import { TErrorSources } from "../interfaces/error";
import config from "../../config";
import { Prisma } from "@prisma/client";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong!";
  let errorSources: TErrorSources = [
    {
      path: "internal",
      message: "Something went wrong",
    },
  ];

  // Handle custom AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: err?.name || "error",
        message: err.message,
      },
    ];
  }

  // Handle Mongoose validation error (optional if you use Mongoose)
  else if (err.name === "ValidationError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorSources = Object.values(err.errors).map((el: any) => ({
      path: el.path,
      message: el.message,
    }));
  }

  // Handle MongoDB cast error (invalid ObjectId)
  else if (err.name === "CastError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid ID format";
    errorSources = [
      {
        path: err.path,
        message: "Invalid ID",
      },
    ];
  }

  // (Optional) handle Zod validation errors if you use Zod
  else if (err?.issues) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation Error";
    errorSources = err.issues.map((issue: any) => ({
      path: issue.path?.join("."),
      message: issue.message,
    }));
  } else if (err.name === "JsonWebTokenError") {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Invalid token";
    errorSources = [
      {
        path: err?.name || "error",
        message: err.message,
      },
    ];
  }

  // prisma validation error
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation error";
    errorSources = [
      {
        path: err?.name || "error",
        message: err.message,
      },
    ];
  }

  // prisma duplicate error
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = httpStatus.BAD_REQUEST;
      message = "Duplicate key error";
      errorSources = [
        {
          path: err?.meta?.target || "error",
          message: err.message,
        },
      ];
    }
  }

  // Default unknown error
  else {
    statusCode = err?.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    message = err?.message || message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    // error: config.env === "development" ? err : undefined,
    // stack: config.env === "development" ? err?.stack : undefined,
  });
};
