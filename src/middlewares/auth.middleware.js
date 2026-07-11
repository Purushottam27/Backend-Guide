import { User } from "../models/user.model.js"
import { ApiError } from "../utilis/apiError.js"
import jwt from 'jsonwebtoken'
import { asyncHandler } from "../utilis/asyncHandler.js"

const verifyJWT =asyncHandler(async(req,res,next) =>{
    try {
        // We only want access token and we can get the access token either from the brower or from the header if we get token from header then inside header there is "Authorized" field whose value Bearer <token> but we only want token so we replaced Bearer with ""
        const accessToken = req.cookies?.accessToken || req.header("Authorized")?.replace("Bearer","")
    
        if(!accessToken){
            throw new ApiError(401,"User is not authenticated")
        }
    
        const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if(!user){
            throw new ApiError(401,"Invalid access token")
        }
    
        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})

export {verifyJWT}