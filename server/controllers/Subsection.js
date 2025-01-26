import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";
import { uploadOnCloudinary } from "../utils/imageUploader.js";


const createSubSection = async (req, res) => {
    try {
        const {title , timeDuration , description , sectionId } = req.body
        const video = req.file.path
        if(!title ||!timeDuration ||!description ||!video){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        const videoUrl = await uploadOnCloudinary(video)
        const newSubSection = await SubSection.create({title, timeDuration , description , videoUrl:videoUrl.secure_url})
        const updateSection = await Section.findByIdAndUpdate(sectionId , {$push:{subSection:newSubSection._id}},{new:true}).populate("subSection")
        console.log(updateSection)
        return res.status(200).json({success:true, message:"Subsection created successfully", subsection:updateSection})
    } catch (error) {
        console.log("Error while creating SubSection")
        return res.status(500).json({success:false, message:"Something went wrong while creating Subsection", error:error.message})
    }
}

const updateSubSection = async (req, res) => {
    try {
        const {title , description , timeDuration , subSectionId} = req.body
        const updateVideoUrl = req.files.videoFile
        if(!title ||!timeDuration ||!description ||!updateVideoUrl){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        const videoUrl = await uploadOnCloudinary(updateVideoUrl,process.env.FOLDER_NAME)
        const updatedSubSection = await SubSection.findByIdAndUpdate(subSectionId, {title, description, timeDuration, videoUrl:videoUrl.secure_url},{new:true})
        return res.status(200).json({success:true, message:"Subsection updated successfully", subsection:updatedSubSection})
    } catch (error) {
        console.log("Error while updating the sub-section")
        return res.status(500).json({success:false, message:"Something went wrong while updating the sub-section", error:error.message})
    }
}


const deleteSubSection = async (req, res) => {
    try {
        const {subSectionId} = req.params
        if(!subSectionId){
            return res.status(400).json({success:false, message:"SubsectionId is required"})
        }
        const deleteSubSection = await SubSection.findByIdAndDelete(subSectionId)
        return res.status(200).json({success:true, message:"Subsection deleted successfully", subsection:deleteSubSection})
    } catch (error) {
        console.log("Error while deleting the sub-section")
        return res.status(500).json({success:false, message:"Something went wrong while deleting the sub-section", error:error.message})
    }
}

export { createSubSection, updateSubSection, deleteSubSection }