import { Request, Response } from "express";
import httpStatus from "http-status";
import { appointmentFilterableFields } from "./appointment.constant";
import { pick } from "../../../shared/pick";
import { catchAsync } from "../../../shared/catchAsync";
import { SendResponse } from "../../../shared/sendResponse";
import { AppointmentService } from "./appointment.service";

const createAppointment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await AppointmentService.createAppointment(user, req.body);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment booked successfully!",
    data: result,
  });
});

const getMyAppointment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const filters = pick(req.query, ["status", "paymentStatus"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await AppointmentService.getMyAppointment(
    user,
    filters,
    options
  );

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My Appointment retrive successfully",
    data: result,
  });
});

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, appointmentFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await AppointmentService.getAllFromDB(filters, options);
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Appointment retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

const changeAppointmentStatus = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;
    const user = req.user;

    const result = await AppointmentService.changeAppointmentStatus(
      id,
      status,
      user
    );
    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Appointment status changed successfully",
      data: result,
    });
  }
);

export const AppointmentController = {
  createAppointment,
  getMyAppointment,
  getAllFromDB,
  changeAppointmentStatus,
};
