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

  const sessionUrl = await PaymentService.initStripePayment(appointmentId);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Stripe Checkout Session created successfully",
    data: sessionUrl,
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

const getSinglePayment = catchAsync(async (req: Request, res: Response) => {
  const result = await PaymentService.getSinglePaymentByID(req.params.id);

  SendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Single Payment data fetched",
    data: result,
  });
});

export const PaymentController = {
  initPayment,
  paymentHistory,
  getSinglePayment,
};
