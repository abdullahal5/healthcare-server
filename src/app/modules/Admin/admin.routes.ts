import express from "express";
import { AdminController } from "./admin.controller";
const router = express.Router();
import { validateRequest } from "../../middleware/validateRequest";
import { AdminValidation } from "./admin.validation";

router.get("/", AdminController.getAllAdmin);

router.get("/:id", AdminController.getSingleAdminById);

router.patch(
  "/:id",
  validateRequest(AdminValidation.updateAdminSchema),
  AdminController.updateAdminById
);

router.delete("/:id", AdminController.deleteAdmin);

router.delete("/soft/:id", AdminController.softDeleteAdmin);

export const AdminRoutes = router;
