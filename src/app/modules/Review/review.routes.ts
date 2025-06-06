import express from "express";
import { ReviewController } from "./review.controller";
import { UserRole } from "@prisma/client";
import { ReviewValidation } from "./review.validation";
import { auth } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validateRequest";

const router = express.Router();

router.get("/", ReviewController.getAllFromDB);

router.post(
  "/",
  auth(UserRole.PATIENT),
  validateRequest(ReviewValidation.create),
  ReviewController.insertIntoDB
);

export const ReviewRoutes = router;
