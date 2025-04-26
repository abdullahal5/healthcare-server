import { NextFunction, Request, Response } from "express";
import { AdminService } from "./admin.service";
import { pick } from "../../../shared/pick";
import { adminFilterableFields } from "./admin.constant";
import { SendResponse } from "../../../shared/sendResponse";
import httpStatus from "http-status";

const getAllAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
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
  } catch (error: any) {
    next(error);
  }
};

const getSingleAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AdminService.getByIdFromDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data fetched successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const updateAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AdminService.updateIntoDB(req.params.id, req.body);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin data updated successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const deleteAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AdminService.deleteIntoDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin deleted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const softDeleteAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await AdminService.softDeleteIntoDB(req.params.id);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Admin soft-deleted successfully",
      data: result,
    });
  } catch (error: any) {
    next(error);
  }
};

export const AdminController = {
  getAllAdmin,
  getSingleAdminById,
  updateAdminById,
  deleteAdmin,
  softDeleteAdmin,
};
