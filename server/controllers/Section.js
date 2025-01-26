import Course from "../models/course.js";
import Section from "../models/Section.js";
import SubSection from "../models/SubSection.js";


const createSection = async (req, res) => {
    try {
        const {sectionName , courseId} = req.body
        if(!sectionName ||!courseId){
            return res.status(400).json({success:false, message:"Name and courseId are required"})
        }
        const newSecton = await Section.create({sectionName})
        const updateCourse = await Course.findByIdAndUpdate({_id:courseId},
            {$push:{courseContent:newSecton._id}},
            {new:true}
        )
        return res.status(200).json({success:true, message:"Section created successfully", section:newSecton})
    } catch (error) {
        console.log("Error while creating section: " + error.message)
        return res.status(500).json({success:false, message:"Something went wrong while creating section",error:error.message})
    }
}

const updateSection = async (req, res) => {
    try {
        const {sectionName , sectionId} = req.body;
        if(!sectionName ||!sectionId){
            return res.status(400).json({success:false, message:"All fields are required"})
        }
        const updateSection = await Section.findByIdAndUpdate(sectionId , {sectionName:sectionName},{new:true})
        return res.status(200).json({success:true, message:"Section updated successfully", section:updateSection})
    } catch (error) {
        console.log("Error while updating section: " + error.message)
        return res.status(500).json({success:false, message:"Something went wrong while updating section",error:error.message})
    }
}


const deleteSection = async (req,res)=>{
    try {

		const { sectionId, courseId }  = req.body;
		await Course.findByIdAndUpdate(courseId, {
			$pull: {
				courseContent: sectionId,
			}
		})
		const section = await Section.findById(sectionId);
		console.log(sectionId, courseId);
		if(!section) {
			return res.status(404).json({
				success:false,
				message:"Section not Found",
			})
		}

		//delete sub section
		await SubSection.deleteMany({_id: {$in: section.subSection}});

		await Section.findByIdAndDelete(sectionId);

		//find the updated course and return 
		const course = await Course.findById(courseId).populate({
			path:"courseContent",
			populate: {
				path: "subSection"
			}
		})
		.exec();

		res.status(200).json({
			success:true,
			message:"Section deleted",
			data:course
		});
	} catch (error) {
		console.error("Error deleting section:", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export { createSection, updateSection, deleteSection }