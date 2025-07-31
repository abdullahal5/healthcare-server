import { Request, Response } from "express";
import httpStatus from "http-status";
import { prescriptionFilterableFields } from "./prescription.constants";
import { catchAsync } from "../../../shared/catchAsync";
import { JwtPayload } from "jsonwebtoken";
import { SendResponse } from "../../../shared/sendResponse";
import { pick } from "../../../shared/pick";
import { PrescriptionService } from "./prescription.service";

const insertIntoDB = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await PrescriptionService.insertIntoDB(
    user as JwtPayload,
    req.body
  );
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription created successfully",
    data: result,
  });
});

const getByAppointment = catchAsync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.getPrescriptionByAppointmentId(
    req.params.appointmentId as string
  );
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription fetched successfully",
    data: result,
  });
});

const updatePrescription = catchAsync(async (req: Request, res: Response) => {
  const result = await PrescriptionService.updatePrescriptionById(
    req.params.id as string,
    req.body
  );

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription updated successfully",
    data: result,
  });
});


const patientPrescription = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.patientPrescription(
    user as JwtPayload,
    options
  );
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescription fetched successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, prescriptionFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await PrescriptionService.getAllFromDB(filters, options);
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Prescriptions retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const PrescriptionController = {
  insertIntoDB,
  getByAppointment,
  patientPrescription,
  updatePrescription,
  getAllFromDB,
};
