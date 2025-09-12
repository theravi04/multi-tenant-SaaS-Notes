import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { upgradeTenant, inviteUser } from "../controllers/tenantController.js";

const router = express.Router();

router.post("/:slug/upgrade", protect, isAdmin, upgradeTenant);
router.post("/:slug/invite", protect, isAdmin, inviteUser);

export default router;
