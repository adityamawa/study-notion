import Profile from "../models/profile.js";
import User from "../models/user.js";
import { uploadOnCloudinary } from "../utils/imageUploader.js";

const updateProfile = async (req,res)=>{
    try {
        const {dateOfBirth="" ,about="",contactNumber , gender} = req.body
        const id = req.user.userId;
        if(!contactNumber || !gender){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        const userDetails = await User.findById({_id:id})
        console.log("User Details are : ",userDetails)
        const profileId = userDetails.additionalDetails
        const profileDetails = await Profile.findById(profileId)
        profileDetails.dateOfBirth = dateOfBirth
        profileDetails.about = about
        profileDetails.contactNumber = contactNumber
        profileDetails.gender = gender

        profileDetails.save()

        const updatedUserDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
        
        return res.status(200).json({success:true, message:"Profile updated successfully",updatedUserDetails})
    } catch (error) {
        console.log("Error updating profile")
        return res.status(500).json({success:false, message:"Something went wrong while updating profile", error:error.message})
    }
}


const deleteAccount = async (req,res)=>{
    try {
        const id = req.user.userId
        const user = await User.findById(id)
        if(!user){
            return res.status(404).json({success:false, message:"User not found"})
        }
        const deleteAdditionalDetails = await Profile.findOneAndDelete({_id:user.additionalDetails})
        console.log("Additonal details to be deleted are:" , deleteAdditionalDetails)
        const deleteUser = await User.findByIdAndDelete(id)
        return res.status(200).json({success:true, message:"Account deleted successfully"})
    } catch (error) {
     console.log("User can't be deleted")
     return res.status(500).json({success:false, message:"Something went wrong while deleting account", error:error.message})
    }
}

const getAllUserDetails = async (req,res)=>{
    try {
        const id = req.user.userId
        const userDetails = await User.findById(id).populate("additionalDetails")
        if(!userDetails){
            return res.status(404).json({success:false, message:"User not found"})
        }
        return res.status(200).json({success:true, userDetails , message:"User fetched successfully"})
        
    } catch (error) {
        console.log("Error while fetching user details")
        return res.status(500).json({success:false, message:"Something went wrong while fetching user details", error:error.message})
    }
}

const updateDisplayPicture = async (req, res) => {
    try {
      console.log(req.file)
      const localFilePath = req.file.path
      const userId = req.user.userId
      console.log("Hello Aditya Mawa",userId)
      const image = await uploadOnCloudinary(
        localFilePath,
        // process.env.FOLDER_NAME,
        // 1000,
        // 1000
      )
      console.log("image data is :" , image)
      const updatedProfile = await User.findByIdAndUpdate(
        { _id: userId },
        { image: image.secure_url },
        { new: true }
      )
      console.log(updateProfile)
      res.send({
        success: true,
        message: `Image Updated successfully`,
        data: updatedProfile,
      })
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: error.message,
      })
    }
  }


export {updateProfile , deleteAccount , getAllUserDetails , updateDisplayPicture}