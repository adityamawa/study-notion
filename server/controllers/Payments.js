import mongoose from "mongoose";
import instance from "../config/razorpay.js"
import Course from "../models/course.js"
import User from "../models/user.js"
import mailSender from "../utils/mailSender.js";
import crypto from "crypto"
import { paymentSuccessEmail } from "../mail/templates/paymentSuccessEmail.js";
import { courseEnrollmentEmail } from "../mail/templates/courseEnrollmentEmail.js";

const capturePayment = async (req,res)=>{
    const {courseId} = req.body;
    const userId = req.user.id;

    if(!courseId){
        return res.status(400).json({success:false, message:"CourseId is required , please provide a valid course"})
    }
    const course = await  Course.findById(courseId)
    if(!course){
        return res.status(404).json({success:false, message:"Course not found"})
    }
    const uid = new mongoose.Types.ObjectId(userId)
    if(course.studentsEnrolled.includes(uid)){
        return res.status(400).json({success:false, message:"You have already enrolled in this course"})
    }

    const amount = course.amount
    const currency = "INR"

    const options = {
        amount : amount * 100,
        currency,
        receipt: `${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        notes:{
            courseId : courseId,
            userId
        }
    }

    try {
        const paymentResponse = await instance.orders.create(options)
        console.log(paymentResponse)
        return res.status(200).json({
            success:true,
            courseName : course.courseName,
            courseDescription : course.courseDescription,
            thumbnail : course.thumbnail,
            orderId : paymentResponse.id,
            amount : paymentResponse.amount,
            currency : paymentResponse.currency,
            message : "Payment request sent successfully"

        })
    } catch (error) {
        console.log(error.message)
        return res.status(500).json({success:false, message:"Something went wrong while processing order"})
    }
}

const verifySignature = async(req , res)=>{
 const webhookSecret = "12345678"
 const signature = req.headers["x-razorpay-signature"]
 const shasum = crypto.createHmac("sha256",webhookSecret)
 shasum.update(JSON.stringify(req.body))
 const digest = shasum.digest("hex")

 if(signature === digest){
    console.log("Payment is authorized")
    const {courseId , userId} = req.body.payload.payment.entity.notes
    try {
        const enrolledCourse = await Course.findByIdAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true}
        )
        if(!enrolledCourse){
            return res.status(500).json({success:false, message:"Course not found"})
        }
        console.log(enrolledCourse)

        const enrolledStudent = await User.findByIdAndUpdate(
            {_id:userId},
            {$push:{courses:courseId}},
            {new:true}
        )
        if(!enrolledStudent){
            return res.status(500).json({success:false, message:"User not found"})
        }
        console.log(studentsEnrolled)

        const emailResponse = await mailSender(
            enrolledStudent.email,
            "Congratulations from Studify",
            "Congratulations, you are onboard into the new Studify Course"
        )
        return res.status(200).json({
            success:true,
            message:"Signature verified and Course added successfully"
        })
    } catch (error) {
        return res.status(500).json({success:false, message:error.message})
    }
 }
 else{
    return res.status(400).json({success:false, message:"Invalid request"})
 }
}

const sendPaymentSuccessEmail = async (req, res) => {
    const { orderId, paymentId, amount } = req.body
  
    const userId = req.user.id
  
    if (!orderId || !paymentId || !amount || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please provide all the details" })
    }
  
    try {
      const enrolledStudent = await User.findById(userId)
  
      await mailSender(
        enrolledStudent.email,
        `Payment Received`,
        paymentSuccessEmail(
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
          amount / 100,
          orderId,
          paymentId
        )
      )
    } catch (error) {
      console.log("error in sending mail", error)
      return res
        .status(400)
        .json({ success: false, message: "Could not send email" })
    }
  }
  
export {capturePayment , verifySignature ,sendPaymentSuccessEmail}