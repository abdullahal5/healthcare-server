import express from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post("/ipn", PaymentController.validatePayment);

router.post("/init-payment/:appointmentId", PaymentController.initPayment);

router.get(
  "/my-history",
  auth(UserRole.PATIENT),
  PaymentController.paymentHistory
);

export const PaymentRoutes = router;
