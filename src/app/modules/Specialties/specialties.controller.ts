import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { SendResponse } from "../../../shared/sendResponse";
import { SpecailtiesServices } from "./specialties.service";

const createSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecailtiesServices.createSpecialtiesIntoDB(req);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties created successfully!",
    data: result,
  });
});

const getAllSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecailtiesServices.getSpecialtiesFromDB();

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialties data fetched successfully",
    data: result,
  });
});

const deleteSpecialties = catchAsync(async (req: Request, res: Response) => {
  const result = await SpecailtiesServices.deleteSpecialtiesFromDB(
    req.params.id
  );

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Specialty deleted successfully",
    data: result,
  });
});

export const SpecialtiesController = {
  createSpecialties,
  getAllSpecialties,
  deleteSpecialties,
};
