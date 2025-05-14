import express, { NextFunction, Request, Response } from "express";
import { auth } from "../../middleware/auth";
import { SpecialtiesController } from "./specialties.controller";
import { upload } from "../../../helper/fileUploader";
import { SpecialtiesValidtaion } from "./specialties.validation";
import { UserRole } from "@prisma/client";

const router = express.Router();

router.post(
  "/",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = SpecialtiesValidtaion.create.parse(JSON.parse(req.body.data));
    return SpecialtiesController.createSpecialties(req, res, next);
  }
);
router.get("/", SpecialtiesController.getAllSpecialties);

router.delete(
  "/:id",
  auth(UserRole.SUPER_ADMIN, UserRole.ADMIN),
  SpecialtiesController.deleteSpecialties
);

export const SpecialtiesRoutes = router;
