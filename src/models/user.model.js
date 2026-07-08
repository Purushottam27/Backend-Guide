import mongoose, { mongo } from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken' // it is a bearer token 
const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true, // usse field me laga te hai jo searching ke liye use hogi
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    coverImage: {
      type: String, // cloudinary url
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    watchedHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

// these is the professional way to bcrypt the password instead of doing in signup but login remain same compare function.
userSchema.pre("save", async (next) => {
  // hook pre is used document ke save hone ke just phele hash kro
  if (!this.isModified("password")) return next(); // passwrod change hua tabhi hash kro bar bar ni

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.method.isPasswordCorrect = async function (password){  // method to check the password
  return await bcrypt.compare(password,this.password)
}

userSchema.method.generateAccessToken = function(){
  const payload = {
    _id : this._id,
    email:this.email,
    username:this.username
  }
  const secret = process.env.ACCESS_TOKEN_SECRET
  const expiry = process.env.ACCESS_TOKEN_EXPIRY

  return jwt.sign(payload,secret,{expiresIn:expiry})
}
userSchema.method.generateRefreshToken = function(){
  const payload = {    // it contain less info as it got refresh and its duration is more than access
    _id : this._id,
  }
  const secret = process.env.REFRESH_TOKEN_SECRET
  const expiry = process.env.REFRESH_TOKEN_EXPIRY
  
  return jwt.sign(payload,secret,{expiresIn:expiry})
}

export const User = mongoose.model("User", userSchema);
