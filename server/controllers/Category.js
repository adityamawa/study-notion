import Category from "../models/category.js";

const createCategory = async (req,res)=>{
  try {
      const {name , description} = req.body;
      if(!name || !description){
          return res.status(400).json({success:false, message:"Name and description are required"})
      }
      const tagDetails = await Category.create({name,description})
      return res.status(200).json({success:true,message:"Category created successfully",tagDetails })
  } catch (error) {
      console.log(error.message)
      return res.status(500).json({success:false, message:"Something went wrong while creating Category"})
  }

}

const showAllCategories = async (req, res)=>{
  try {
      const allCategory = await Category.find({},{name:true,description:true})
      return res.status(200).json({success:true,message:"All Categories returned successfully",allCategory})
  } catch (error) {
      return res.status(500).json({success:false, message:error.message})
  }
}

const categoryPageDetails = async (req, res)=>{
  try {
      const {categoryId} = req.body
      const selectedCategory = await Category.findById(categoryId)
                                             .populate("courses")
                                             .exec()
      if(!selectedCategory){
          return res.status(404).json({success:false, message:"Category not found"})
      }
      const differentCategory = await Category.findById(
                                              {_id:{$ne:categoryId}}
                                          )
                                          .populate("courses")
                                          .exec()
      return res.status(200).json({success:true, selectedCategory, differentCategory, message:"Category details returned successfully"})                                            
  } catch (error) {
      console.log(error.message)
      return res.status(500).json({success:false, message:"Something went wrong while fetching category details"})
  }
}

export { createCategory, showAllCategories, categoryPageDetails }