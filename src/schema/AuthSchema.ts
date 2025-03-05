import * as z from 'zod';

export const registerSchema=z.object({
    email:z.string({required_error:"Email is required"})
    .email({message:"Invalid Email"}),
    password:z.string({required_error:"Password is required"})
    .min(6,{message:"Password must be atleast 6 characters long"}),
    name:z.string({ required_error:"Name is required"})
    .min(3,{message:"Name must be atleast 3 charactors long"})
    .max(50,{message:"Name is too long"}),
    bio:z.string()
    .max(100,{message:"Bio should be less then 100 charactors"})

})

export const signinSchema=z.object({
    email:z.string({required_error:"Email is required.."})
    .email({message:"Invalid Email"}),
    password:z.string({required_error:"Password is required.."})
    .min(6,{message:"Password must be atleast 6 characters long"}),
})

export const verifyOtp=z.object({
    otp:z.string().min(6,"Otp minimun 6 digit")
    
})

export const resendEmailSchema=z.object({
    email:z
    .string({required_error:"email is required"})
 .email({message:"Email is invalid"})}
)
export const forgotPasswordSchema = z.object({
    email: z
      .string({ required_error: "email is required" })
      .email({ message: "email is invalid" }),
  });

  export const verifyForgotPasswordSchema = z.object({
    password: z
      .string({ required_error: "password is required" })
      .min(8, { message: "password must be 8 charector" }),
    otp: z.string().min(4, "otp minimum 4 digit"),
  });