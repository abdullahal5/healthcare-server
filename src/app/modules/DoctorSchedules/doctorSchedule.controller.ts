import { Request, Response } from "express";
import { catchAsync } from "../../../shared/catchAsync";
import httpStatus from "http-status";
import { SendResponse } from "../../../shared/sendResponse";
import { pick } from "../../../shared/pick";
import { scheduleFilterableFields } from "./doctorSchedule.constants";
import { DoctorScheduleService } from "./doctorSchedule.service";

const insertIntoDB = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await DoctorScheduleService.insertIntoDB(user, req.body);

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Doctor Schedule created successfully!",
      data: result,
    });
  }
);

const getMySchedule = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, ["startDate", "endDate", "isBooked"]);
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

    const user = req.user;
    const result = await DoctorScheduleService.getMySchedule(
      filters,
      options,
      user
    );

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule fetched successfully!",
      data: result,
    });
  }
);

const deleteFromDB = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const { id } = req.params;
    const result = await DoctorScheduleService.deleteFromDB(
      user,
      id
    );

    SendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Schedule deleted successfully!",
      data: result,
    });
  }
);

const getAllFromDB = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, scheduleFilterableFields);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await DoctorScheduleService.getAllFromDB(filters, options);
  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor Schedule retrieval successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const DoctorScheduleController = {
  insertIntoDB,
  getMySchedule,
  deleteFromDB,
  getAllFromDB,
};
