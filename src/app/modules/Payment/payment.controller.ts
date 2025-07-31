import { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../../shared/catchAsync";
import { SendResponse } from "../../../shared/sendResponse";
import { PaymentService } from "./payment.service";
import { pick } from "../../../shared/pick";
import { paymentFilterableFields } from "./payment.constant";
import { JwtPayload } from "jsonwebtoken";

const initPayment = catchAsync(async (req: Request, res: Response) => {
  const { appointmentId } = req.params;
  const result = await PaymentService.initPayment(appointmentId);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment initiate successfully",
    data: result,
  });
});

const validatePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.validatePayment(req.body);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment validate successfully",
    data: result,
  });
});

const paymentHistory = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, paymentFilterableFields);

  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);

  const result = await PaymentService.getPatientPaymentHistory(
    filters,
    options,
    req.user as JwtPayload
  );

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payment history fetched successfully!",
    meta: result.meta,
    data: result.data,
  });
});

export const PaymentController = {
  initPayment,
  validatePayment,
  paymentHistory,
};
