import { Request, RequestHandler, Response } from "express";
import { UserService } from "./user.service";
import { catchAsync } from "../../../shared/catchAsync";
import httpStatus from "http-status";
import { SendResponse } from "../../../shared/sendResponse";
import { pick } from "../../../shared/pick";
import { userFilterableFields } from "./user.constant";

const createAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createAdminIntoDB(req);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin created successfully",
      data: result,
    });
  }
);

const createDoctor: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createDoctorIntoDB(req);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor created successfully",
      data: result,
    });
  }
);

const createPatient: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await UserService.createPatientIntoDB(req);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, userFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await UserService.getAllFromDB(filters, options);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users data fetched!",
    meta: result.meta,
    data: result.data,
  });
});

const changeProfileStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const result = await UserService.changeStatus(id, req.body);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Users profile status changed!",
    data: result,
  });
});


export const UserController = {
  createAdmin,
  createDoctor,
  createPatient,
  getAllFromDB,
  changeProfileStatus,
};
