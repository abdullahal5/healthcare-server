import { Request, RequestHandler, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../../shared/catchAsync";

const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createAdminIntoDB(req);

    res.status(200).json({
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);

export const UserController = {
  createAdmin,
};
