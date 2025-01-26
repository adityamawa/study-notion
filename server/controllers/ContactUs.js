import { contactUsEmail } from "../mail/templates/ContactForm";
import mailSender from "../utils/mailSender";




const contactUsController = async (req,res)=>{
  const {email, firstName , lastName , phoneNo , countryCode , message} = req.body
  try {
      const mailResponse = await mailSender(
                                 email,
                                 "Your Data Sent Successfully",
                                 contactUsEmail(email,firstName,lastName,phoneNo,countryCode))
      console.log("EmailResponse: " + mailResponse)
      return res.json({
          success: true,
          message: "Email send successfully",
        })                                  
  } catch (error) {
      console.log("Error", error)
      console.log("Error message :", error.message)
      return res.json({
        success: false,
        message: "Something went wrong...",
      })
  }
}



export {contactUsController}