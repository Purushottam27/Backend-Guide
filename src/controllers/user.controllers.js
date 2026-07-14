import { asyncHandler } from "../utilis/asyncHandler.js";
import {ApiError} from "../utilis/apiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utilis/cloudinary.js'
import {ApiResponse} from "../utilis/apiResponse.js"
import jwt from "jsonwebtoken"
const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        // set refresh token in database
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false}) // hame save krte time baki validation ni krvane

        return {accessToken,refreshToken}
    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating refresh and access tokens")
    }
}

const registerUser = asyncHandler(async (req,res) =>{
    // 1. get all the data from the user 
    // 2. validate it whether it is null or not
    // 3. check if user already exist : username or email
    // 4. get all the files which user may uploaded and handled/passed from the multer middleware
    // 5. validate check wether the required files are empty or not
    // 6. upload them on the cloudinary
    // 7. then check again that if the required files are uploaded or not
    // 8. then create the user object and create the user in DB.
    // 9. validate if user is created or not
    // 10. remove the password and the refersh token from the response 
    // 11. then send the response to the user.

    // 1
    const {fullname,username,email,password} = req.body;

    // 2
    if(
        [fullname,username,email,password].some( // the some method of an array checks every ele with there condition and  return the true and false 
            (field)=>{
                return field?.trim() === ""
            }
        )
    ){
        throw new ApiError(400,"All fields are required") // if it is true then field is empty (agar ye bhi bata na hai kon si field empty hai to switch case ka bhi use kr sakte hai)
    }

    // 3
    const existedUser = await User.findOne({
        $or:[
            {email:email},
            {username:username}
        ]
    })
    console.log(existedUser)
    if(existedUser) throw new ApiError(409,"User with these username or email already exists");

    // 4
    console.log(req.files) // the multer middleware had injected these property inside the req obj which contain all the details about the files 
    const avatarLocalPath = req.files?.avatar?.[0]?.path; 
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path
    // as we have injected the middleware inside the route for getting the specific field and its count so middleware stored them in the form of array inside the files so we extracted the specific file if it exist thorugh ['avatar'][0] and then if its path exist we have taken that

    // 5
    if(!avatarLocalPath) throw new ApiError(400,"Avatar file is required");

    // 6
    const uploadAvatar = await uploadOnCloudinary(avatarLocalPath)
    const uploadCoverImage = await uploadOnCloudinary(coverImageLocalPath)
    // we have already created the upload function for cloudinary which returns us a response which contains the details of the cloudinary files where it is stored, its url etc...

    // 7
    console.log(uploadAvatar)
    console.log(uploadCoverImage)
    
    if(!uploadAvatar) throw new ApiError(400,"Avatar file is not uploaded");

    // 8
    const user = await User.create({
        fullname:fullname,
        email:email,
        username:username,
        password:password,
        avatar:uploadAvatar.url, // we have taken the url from the response and later send it to user.
        coverImage:(uploadCoverImage !== null) ? uploadCoverImage.url : "", // agar user ne pas ni kiya to empty string store kr denge
    })

    console.log(user)
    // if(!user) throw new ApiError(500,"User is not created");
    
    // 9,10
    const createdUser = await User.findById(user._id).select(  // select method selects the fields in two way (needed fields, not needed fields)
        "-password -refreshToken" // these is how we select the fields that is not required else all are stored in createUser
    )
    if(!createdUser) throw new ApiError(500,"Something went wrong while creating a user");

    // 11
    return res.status(201).json(
        new ApiResponse(200, user, "User registered successfully") // it is a new object
    )

})

const loginUser = asyncHandler(async(req,res)=>{
    // 1. get the user data: email/username, password
    // 2. validate wether they are empty or not
    // 3. then check if user  exist or not
    // 4. if exist then verify the password
    // 5. generate the refersh token and access token
    // 6. then set the tokens in the cookies with options
    // 7. select the relevent data that to be send to the user.
    // 8. then send the response

    // 1
    console.log(req.body)
    const {email,username,password} = req.body;

    // 2
    if( !(email || username) || !password ){
        throw new ApiError(400,"All the fields are required")
    }

    // 3
    const existedUser = await User.findOne({
        $or:[
            {email:email},
            {username:username}
        ]
    })
    if(!existedUser){
        throw new ApiError(404,"User not exist, Signup instead")
    }

    // 4
    const isPasswordValid = await existedUser.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(400,"Incorrect Password")
    }

    // 5
    const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(existedUser._id)

    // 6
    const options = {
        httpOnly : true,
        secure : true,
        // sameSite:'strict'
    }
    res.cookie('accessToken',accessToken,options).cookie('refreshToken',refreshToken,options)

    // 7
    const loggedUser = await User.findById(existedUser._id).select(  
        "-password -refreshToken" 
    )

    // 8
    return res.status(201).json(
        new ApiResponse(
            200,
            {
                user:loggedUser,
                accessToken:accessToken,
                refreshToken:refreshToken
            },
            "User Logged in successfully"
        )
    )
})

const logoutUser = asyncHandler(async(req,res)=>{
    // for logout we want the userId to remove the refresh token from the database that is why we created the auth middleware which is actualy checks the authentication of user.
    const userId = req.user._id
    await User.findByIdAndUpdate(userId,
        {
            $unset:{
                refreshToken:1 // this delete these field from the document
            }
        },
        {
            new:true // usually findByIdAndUpdate returns the before user updated info but after using new:true we get the updated user info.
        }
    )
    
    const options = {
        httpOnly:true,
        secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken",options)
    .json(
        new ApiResponse(200,{},"User Log Out successfully")
    )
})

const refreshAccessToken = asyncHandler(async(req,res)=>{
    // 1 get the user refresh token first
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    // 2 validate it 
    if(!incomingRefreshToken){
        throw new ApiError(401,"User is not authenticated")
    }

    try {
        // 3 then check if the token is valid 
        const decodedPayload = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
        // 4 get all the details of the user 
        const user = await User.findById(decodedPayload?._id)
        

        // 5 then check if user with that refresh payload id exist
        if(!user){
            throw new ApiError(401,"Invalid refresh token")
        }
    
        // 6 also check if both the refresh token are equal or not
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, 'Refresh token is expired or used')
        }
    
        // 7 then generate the access and refresh token 
        const {accessToken,newRefreshToken} = await generateAccessAndRefreshTokens(user._id)
    
        // 8 then send the response to user
        const options = {
            httpOnly : true,
            secure : true,
            // sameSite:'strict'
        }
    
        return res.status(201)
        .cookie('accessToken',accessToken,options)
        .cookie('refreshToken',newRefreshToken,options)
        .json(
            new ApiResponse(
                200,
                {
                    accessToken:accessToken,
                    refreshToken:newRefreshToken
                },
                "Token is refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500,error?.message || "Something went wrong while generating the refresh token")
    }
})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new ApiError(400,"All fields required")
    }

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        return new ApiError(400,"Invaild old password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,{},"Password is changed successfully")
    )
})

const getCurrentUser = asyncHandler(async(req,res)=>{
    return res.status(200).json(
        new ApiResponse(200,{user:req.user},"Current user fetched successfully")
    )
})

const updateProfileDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body;

    if(!fullname || !email){
        throw new ApiError(400,"All fields required")
    }

    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                email:email,
                fullname:fullname
            }
        },
        {
            new:true
        }
    ).select('-password -refreshToken')

    res.status(200).json(
        new ApiResponse(200,user,"Profile details updated successfully")
    )
})

const updateUserAvatar = asyncHandler(async(req,res) => {
    const avatarLocalPath = req.file?.path; // not files as we want ony single file 

    if(!avatarLocalPath){
        throw new ApiError(400,"User avatar not found")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400,"Something went wrong file updating the avatar on cloudinary")
    }

    const updatedInfo = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!updatedInfo){
        throw new ApiError(400,"Something went wrong file updating the avatar in Database")
    }

    return res.status(200).json(
        new ApiResponse(200,updatedInfo,"User avatar updated successfully")
    )
})

const updateUserCoverImage = asyncHandler(async(req,res) => {
    const coverImageLocalPath = req.file?.path; // not files as we want ony single file 

    if(!coverImageLocalPath){
        throw new ApiError(400,"User cover image not found")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!coverImage.url){
        throw new ApiError(400,"Something went wrong file updating the cover image on cloudinary")
    }

    const updatedInfo = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                coverImage:coverImage.url
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")

    if(!updatedInfo){
        throw new ApiError(400,"Something went wrong file updating the cover image in Database")
    }

    res.status(200).json(
        new ApiResponse(200,updatedInfo,"User cover image updated successfully")
    )
})

const getUserProfileDetails = asyncHandler(async(req,res)=>{
    const username = req.params?.username;
    if(!username?.trim()){   // username ko DB me trim krke or lowercase me rakha hai isliye compare bhi ussi tara krna pade ga
        throw new ApiError(400,"Username not found")
    }

    const channel = await User.aggregate([
        {
            $match:{
                username:username?.toLowerCase()
            },
        },
        {
            // here we have to join the user with the channel to get all the documents which shows who have subscribed the channel it comes in array
            $lookup:{
                from:"subscriptions", // here the actual collection name should be written
                localField:"_id",
                foreignField:"channel",
                as:"subscribers"
            }
            // Join User with Subscription collection to get all subscription
            // documents where this user is the channel.
            // This tells us who has subscribed to this channel.
        }, // now the subscribers field is been added into the user doc which contains the array of obj of all subscribers
        {
            // here we join the user with the subscriber field to get all the doc which shows the which are the channels does the user have subscribed.
            $lookup:{
                from:"subscriptions", 
                localField:"_id",
                foreignField:"subscriber",
                as:"subscribedTo"
            }
            // Join User with Subscription collection where this user is
            // the subscriber.
            // This tells us which channels this user has subscribed to.
        }, // now the subscribedTo field is been added into the user doc which contains the array of obj of all channels user subscribedTo
        {
            $addFields:{
                subscribersCount:{
                    $size:"$subscribers"
                },
                channelsSubscribedToCount:{
                    $size:"$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if:{
                            $in: [req.user?._id,"$subscribers.subscriber"] 
                            // subscribers is an array of subscription documents.
                            // Each document contains subscriber and channel fields.
                            // We check whether the logged-in user's _id exists in
                            // subscribers.subscriber.
                        },
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{  // which are the fields that we need to give in obj array
                fullname : 1,
                username: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                createdAt: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1
               
            }
        }
    ])

    if(!channel.length){
        throw new ApiError(400,"Channel not found")
    }

    return res.status(200).json(
        new ApiResponse(200,channel[0],"User profile fetched successfully")
    )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateProfileDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserProfileDetails
}