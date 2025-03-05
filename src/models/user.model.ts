import jwt from "jsonwebtoken";
import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";
interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  contacts: mongoose.Types.ObjectId[];
  firebaseToken?: string;
  isOnline: boolean;
  friendRequest: {
    sent: mongoose.Types.ObjectId[];
    received: mongoose.Types.ObjectId[];
  };
  isEmailVerified:boolean;
  otp: number | undefined;
  avatar: object;
  refreshToken: string | null;
  comparePassword(password: string): Promise<boolean>;
  createAccessToken(): string;
  createRefreshToken(): string;
  generateToken:(otp:number,id:string)=>Promise<string>;
}

const userSchema: Schema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    bio: String,
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    otp: {
      type: String,
      default: undefined,
    },
    firebaseToken: String,
    isOnline: {
      type: Boolean,
      default: false,
      required: true,
    },
    
    friendRequest: {
      sent: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      received: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
    },
    avatar: {
      required: false,
      type: {
        url: String,
        public_id: String,
      },
    },
    refreshToken: {
      type: String,
    },
    isEmailVerified:{
      type:Boolean,
      default:false
    },
  },

  { timestamps: true }
);

userSchema.pre("save", async function (this: IUser & Document, next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.createAccessToken = function () {
  //@ts-ignore

  return jwt.sign(
    { _id: this._id, name: this.name, email: this.email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY!}
  );
};

userSchema.methods.createRefreshToken = function () {
  //@ts-ignore
  
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY! || "10d" } as {
      expiresIn: string | number;
    }
  );
};

userSchema.methods.generateToken = async function (otp: number, id: string) {
  //@ts-ignore
  return jwt.sign(
    {
      otp,
      id,
    },
    process.env.OTP_SECRET as string,
    {
      expiresIn: process.env.OTP_EXPAIRY,
    }
  );
};
const User = mongoose.model<IUser>("User", userSchema);

export default User;
