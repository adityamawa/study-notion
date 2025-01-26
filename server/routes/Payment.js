import { Router } from "express";
 const router = Router()
import { capturePayment , verifySignature , sendPaymentSuccessEmail } from "../controllers/payments.js";
import { paymentSuccessEmail } from "../mail/templates/paymentSuccessEmail.js";
import { auth , isAdmin ,isStudent } from "../middlewares/auth.js";

router.route("/capturePayment").post(auth,isStudent , capturePayment)
router.route("/verifyPayment").post(auth,isStudent,verifySignature)
router.route("/sendPaymentSuccessEmail").post(auth,isStudent,paymentSuccessEmail)

export default router;