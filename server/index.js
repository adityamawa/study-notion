import dotenv from "dotenv"
dotenv.config({path:"./.env"})
import express from "express"
const app = express()

import userRoutes from "./routes/User.js"
import profileRoutes from "./routes/profile.js"
import paymentRoutes from "./routes/payment.js"
import courseRoutes from "./routes/course.js"

import database from "./config/databse.js"
import cookieParser from "cookie-parser"
import cors from "cors"
import { cloudinaryConnect } from "./config/Cloudinary.js"
import fileUpload from "express-fileupload"
import dbConnect from "./config/databse.js"

const PORT = process.env.PORT || 4000

await dbConnect();

app.use(express.json());
app.use(cookieParser())
app.use(cors(
    {
        origin: "http://localhost:3000",
        credentials: true,
    }
))
// app.use(fileUpload({
//     useTempFiles:true,
//     tempFileDir:"/temp"
// }))

cloudinaryConnect();

app.use("/api/v1/auth",userRoutes)
app.use("/api/v1/profile",profileRoutes)
app.use("/api/v1/course",courseRoutes)
app.use("/api/v1/payment",paymentRoutes)

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"Your server is up and running..."
    })
})

app.listen(PORT,()=>{
    console.log(`App is running on port ${PORT}`)
})