import nodemailer from "nodemailer"
import Mailgen from "mailgen";

interface Imail{
    email:string,
    subject:string
    MailgenContent:any
}

 const sendEmail=async({email,subject,MailgenContent}:Imail)=>{

    const mailiGenerator=new Mailgen({
        theme:"default",
        product:{
        name:"WaveChat",
        link: "http://localhost:5173/",
        },
    })

    let emailBody=mailiGenerator.generate(MailgenContent);
    let emailText=mailiGenerator.generatePlaintext(MailgenContent);

    const transporter=nodemailer.createTransport({
        host:"smtp.gmail.com",
        port:465,
        secure:true,
        auth:{
            user:process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS,
        }
    })


const EmailOption={
    from:`WaveChat ${process.env.EMAIL_USER}`,
    to:email,
    subject:subject,
    text:emailText,
    html:emailBody,
}

try {
    await transporter.sendMail(EmailOption)
} catch (error:any) {
    ("Email service failed silently. Make sure you have provided your MAILTRAP credentials in the .env file");
    console.log(error?.message);
}
}


const SendEmailVerification=(username:string,verifyOtp:number)=>{
    return {
        body: {
            name: username,
            intro: "Welcome to our app! We're very excited to have you on  WaveChat",
            dictionary: {
              OTP: verifyOtp
            },
            outro:
              "Need help, or have questions? Just reply to this email, we'd love to help.",
          },
    }
}


export {sendEmail,SendEmailVerification} 