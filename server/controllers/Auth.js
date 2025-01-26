import User from "../models/user.js"
import otpGenerator from "otp-generator"
import Otp from "../models/otp.js"
// import {otp} from "../models/otp.model.js"
import bcrypt from "bcrypt"
import Profile from "../models/profile.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config({path:"./.env"})

const sendOtp = async (req, res) => {
  try {
      const { email } = req.body;

      // Check if user already exists
      const userAlreadyExists = await User.findOne({ email });
      if (userAlreadyExists) {
          return res.status(400).json({ message: "User already exists" });
      }

      // Generate OTP
      let otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
          lowerCaseAlphabets: false,
          specialChars: false
      });
      console.log("OTP generated is:", otp);

      // Ensure the OTP is unique
      let existingOtp = await Otp.findOne({ email });
      while (existingOtp) {
          otp = otpGenerator.generate(6, {
              upperCaseAlphabets: false,
              lowerCaseAlphabets: false,
              specialChars: false
          });
          existingOtp = await Otp.findOne({ otp });
      }

      // Save OTP to the database
      const dbSaveOtp = await Otp.create({
          email,
          otp
      });

      return res.status(200).json({ message: "OTP sent successfully", dbSaveOtp });
  } catch (error) {
      console.log("Error generating OTP:", error);
      return res.status(500).json({ message: "Error generating OTP", error });
  }
};


 const signup = async(req,res)=>{
  try {
    // Destructure fields from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body
    // Check if All Details are there or not
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).send({
        success: false,
        message: "All Fields are required",
      })
    }
    // Check if password and confirm password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and Confirm Password do not match. Please try again.",
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists. Please sign in to continue.",
      })
    }

    // Find the most recent OTP for the email
    const response = await Otp.find({ email }).sort({ createdAt: -1 }).limit(1)
    console.log("response" , response)
    if (response.length === 0) {
      // OTP not found for the email
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      })
    } else if (otp !== response[0].otp) {
      // Invalid OTP
      return res.status(400).json({
        success: false,
        message: "The OTP is not valid",
      })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    let approved = ""
    approved === "Instructor" ? (approved = false) : (approved = true)

    // Create the Additional Profile For User
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    })
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType: accountType,
      approved: approved,
      additionalDetails: profileDetails._id,
      image: "",
    })

    return res.status(200).json({
      success: true,
      user,
      message: "User registered successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    })
  }
    
 }

 const login = async(req,res)=>{
    try {
        const {email,password} = req.body
        if(!email ||!password){
            return res.status(403).json({success:false , message:"All fields are required"})
        }
        const user = await User.findOne({email}).populate("additionalDetails")
        console.log(user)
        if(!user){
            return res.status(401).json({success:false,message:"No such user exists"})
        }
        const isPasswordCorrect = await bcrypt.compare(password , user.password)
        if(!isPasswordCorrect){
            return res.status(400).json({success:false , message:"Invalid password"})
        }
        const payload = {
            email:user.email,
            userId:user._id,
            accountType:user.accountType,
        }
        const token = jwt.sign(payload,process.env.JWT_SECRET,{
            expiresIn:"2h"
        })
        user.token = token
        user.password = undefined
        const options = {
            expires:new Date(Date.now() + 3*24*60*60*1000),
            httpsOnly:true
        }
        res.cookie("token",token,options).status(200).json({success:true,token,user,message:"Logged IN Successfully"})
        

    } catch (error) {
        console.log("Error while logging the user",error)
        return res.status(400).json({success:false , message:"Invalid credentials"})
    }
 }

 const updatePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword, confirmPassword } = req.body;
  
      // Check for required fields
      if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(403).json({ success: false, message: "All fields are required" });
      }
  
      const userId = req.user._id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(400).json({ success: false, message: "User not found" });
      }
  
      // Compare provided old password with the stored hashed password
      const verifyPassword = await bcrypt.compare(oldPassword, user.password);
      if (!verifyPassword) {
        return res.status(400).json({ success: false, message: "Invalid old password" });
      }
  
      // Check if new password matches confirm password
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ success: false, message: "Passwords do not match" });
      }
  
      // Hash the new password and update the user's password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await user.save();
  
      return res.status(200).json({ success: true, message: "Password updated successfully" });
  
      // TODO: Send an email to the user about the password update
    } catch (error) {
      console.error("Error while updating the password", error);
      return res.status(500).json({ success: false, message: "Internal server error while updating the password" });
    }
  };
  


 export {sendOtp,signup,login,updatePassword}