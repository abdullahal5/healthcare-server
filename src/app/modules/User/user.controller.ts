import { Request, RequestHandler, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../../shared/catchAsync";
import httpStatus from "http-status";

const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createAdminIntoDB(req);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);

const createDoctor: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createDoctorIntoDB(req);

    res.status(httpStatus.OK).json({
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);

export const UserController = {
  createAdmin,
  createDoctor,
};
