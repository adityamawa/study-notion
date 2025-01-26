import { Router } from "express";
import { contactUsController } from "../controllers/contactUs";
contactUsController
const router = Router();

router.route("/contact").post(contactUsController)

export default router;