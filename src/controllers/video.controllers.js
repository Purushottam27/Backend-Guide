import { asyncHandler } from "../utilis/asyncHandler.js";
import {ApiError} from "../utilis/apiError.js"
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from '../utilis/cloudinary.js'
import {ApiResponse} from "../utilis/apiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";

const uploadVideo = asyncHandler(async(req,res)=>{
    const {title,description} = req.body

    if(!title || !description){
        throw new ApiError(400,'All fields required')
    }

    const videoLocalPath = req.files?.videoFile?.[0]?.path
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path

    if(!videoLocalPath){
        throw new ApiError(400,'Video file required')
    }
    if(!thumbnailLocalPath){
        throw new ApiError(400,'Thumbnail required')
    }

    const uploadVideoFile = await uploadOnCloudinary(videoLocalPath)
    const uploadThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!uploadVideoFile.url || !uploadThumbnail.url){
        throw new ApiError(500,'Something went wrong file uploading video or thumbnail')
    }

    const video = await Video.create({
        videoFile: uploadVideoFile.url,
        thumbnail: uploadThumbnail.url,
        title: title,
        description:description,
        owner: req.user?._id,
        duration: uploadVideoFile.duration,
        isPublished:true
    }) 

    if(!video){
        throw new ApiError(500,'Soemthing went wrong while uploading the video in database')
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            video,
            'Video uploaded successfully'
        )
    )
})

// need to update if we create the like and comment schema a s well
const getVideo = asyncHandler(async(req,res)=>{
    const videoId = req.params?.id
    const userId = req.user?._id
    if(!videoId){
        throw new ApiError(400,'Video not found')
    }

    // we can also do these instead of seprate waiting:
    // await Promise.all([Video...,User...,User...])

    // to increment the count of views 
    await Video.findByIdAndUpdate(
        videoId,
        {
            $inc:{
                views:1
            }
        }
    );  // isko aggregation ke badh use kre ge to views tabhi increamnt honge jab user certain duration tal dekh lega video.

    // push these video in the users watched history. we cannot use the pull and push both in single update operation
    await User.findByIdAndUpdate(userId,
        {
            $pull:{
                watchedHistory: videoId  // removes the video if present
            }
        }
    )

    await User.findByIdAndUpdate(userId,
        {
            $push:{
                watchedHistory:{
                    // these are the properties that push operator had
                    $each:[videoId], // push each val individually not in array form in the array
                    $position: 0, // intentially push the video id in first position(0th index)
                    // $sort: 1,  // no need
                    // $slice: 5 these would only store 5 videoId that is why we should not do these as we want the overall history 
                }
            }
        }
    )

    const video = await Video.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(videoId)
            }
        },

        // join the video and the owner to get the channel info 
        {
            $lookup:{
                from:'users',
                localField:'owner',
                foreignField:'_id',
                as:'owner',
                pipeline:[
                    {
                        $project:{
                            username:1,
                            avatar: 1
                        }
                    },
                ]
            }
        },

        // likes lookup 
        // comment lookup
        // then addfield that counts the total like, comment and isliked or isSubsribed

        {
            $addFields:{
                ownerDetails:{
                    $first:'$owner'
                }
            }
        },
    ])

    if(!video.length){
        throw new ApiError(400,'Video not found')
    }

    return res.status(200).json(
        new ApiResponse(200,video,'Video is fetched successfully')
    )
})


export {
    uploadVideo,
    getVideo
}