import Course from "../models/course.js";
import Category from "../models/category.js";
import User from "../models/user.js"
import { uploadOnCloudinary } from "../utils/imageUploader.js";
const createCourse = async (req, res) => {
    try {
        const { courseName, courseDescription, whatYouWillLearn, price, tag ,category } = req.body;
        console.log("thumbaillllllllll" , req.file)
        const thumbnail = req.file.path;
        if (!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail || !category) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }
        const userId = req.user.userId;
        const instructorDetails = await User.findById(userId);
        console.log("Instructor Details: " + instructorDetails)
        if (!instructorDetails) {
            return res.status(400).json({ success: false, message: "Instructor not found" })
        }
        const tagDetails = await Category.findById(category)
        if (!tagDetails) {
            return res.status(400).json({ success: false, message: "Tag not found" })
        }
        const thumbnailImage = await uploadOnCloudinary(thumbnail)
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructor: instructorDetails._id,
            whatYouWillLearn,
            price,
            tag: tagDetails._id,
            thumbnail: thumbnailImage.secure_url
        })
        const updateUserCourseArray = await User.findByIdAndUpdate({ _id: instructorDetails._id },
            {
                $push: { courses: newCourse._id }
            },
            { new: true }

        )
        return res.status(200).json({ success: true, message: "Course created successfully", course: newCourse })
    } catch (error) {
        console.log("Failed to create Course", error)
        return res.status(500).json({ success: false, message: error.message })
    }
}

const showAllCourses = async (req, res) => {
    try {
        const allCourses = await Course.find({}, { courseName: true, price: true, thumbnail: true, instructor: true, ratingAndReviews: true, studentsEnrolled: true }).populate("instructor").exec();
        return res.status(200).json({ success: true, courses: allCourses, message: "All courses fetched successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Something went wrong while fetching courses", error: error.message })
    }
}

const getCourseDetails = async (req, res) => {
    try {
        const {courseId } = req.body
        const courseDetails = await Course.findById(courseId)
                                        //  .populate(
                                        //     {path:"instructor",
                                        //     populate:{
                                        //         path:"additonalDetails"
                                        //     }
                                        //     },
                                        //     )
                                        //  .populate("category")
                                        //  .populate("ratingAndReviews")
                                         .populate(
                                            {path:"courseContent",
                                                populate:{
                                                    path:"subSection"
                                                }
                                            }
                                         )
                                         .exec()

        if(!courseDetails){
            return res.status(404).json({ success: false, message: "Course not found" })
        }
        return res.status(200).json({ success: true, courseDetails, message: "Course fetched successfully" })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ success: false, message: "Something went wrong while fetching course details", error: error.message })
    }
}

export { createCourse, showAllCourses , getCourseDetails} 