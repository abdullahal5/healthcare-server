import express from "express";
import { PaymentController } from "./payment.controller";
import { auth } from "../../middleware/auth";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/create-checkout-session/:appointmentId",
  auth(UserRole.PATIENT),
  PaymentController.initPayment
);

router.get(
  "/my-history",
  auth(UserRole.PATIENT),
  PaymentController.paymentHistory
);

router.get(
  "/:id",
  auth(UserRole.PATIENT, UserRole.DOCTOR, UserRole.SUPER_ADMIN, UserRole.ADMIN),
  PaymentController.getSinglePayment
);

export const PaymentRoutes = router;
