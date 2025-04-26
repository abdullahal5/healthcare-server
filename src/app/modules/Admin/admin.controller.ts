import { NextFunction, Request, RequestHandler, Response } from "express";
import { AdminService } from "./admin.service";
import { pick } from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { SendResponse } from "../../../shared/sendResponse";
import httpStatus from "http-status";
import { catchAsync } from "../../../shared/catchAsync";

const getAllAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, adminFilterableFields);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const result = await AdminService.getAllAdminFromDB(filters, options);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getSingleAdminById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getByIdFromDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data fetched successfully",
      data: result,
    });
  }
);

const updateAdminById: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.updateIntoDB(req.params.id, req.body);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data updated successfully",
      data: result,
    });
  }
);

const deleteAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.deleteIntoDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  }
);

const softDeleteAdmin: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.softDeleteIntoDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin soft-deleted successfully",
      data: result,
    });
  }
);

export const AdminController = {
  getAllAdmin,
  getSingleAdminById,
  updateAdminById,
  deleteAdmin,
  softDeleteAdmin,
};
