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
                        $project:{ // kis channel ne video upload kiya hai
                            username:1,
                            avatar: 1
                        }
                    },
                ]
            }
        },

        // likes lookup 
        {
            $lookup:{
                from:'likes',
                localField:'_id',
                foreignField:'likedVideo',
                as:'likeDetails'
            }
        },

        // comment lookup
        {
            $lookup:{
                from:'comments',
                localField:'_id',
                foreignField:'video',
                as:'commentsDetails'
            }
        },

        // then addfield that counts the total like, comment and isliked or isSubsribed

        {
            $addFields:{
                owner:{
                    $first:'$owner'
                },

                totalLikesCount:{
                    // the size want an array so if the array is empty ir shows error
                    $size: '$likeDetails'
                },

                totalComments:{
                    $size: '$commentsDetails'
                },

                isLiked:{
                    $cond:{
                        if: req.user?._id === "$likeDetails.likedBy",
                        then: true,
                        else:false
                    }
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

// owener can only have the right to do these 
const channelVideos = asyncHandler(async(req,res)=>{
    const channelName = req.params?.channelName;

    if(!channelName?.trim()){
        throw new ApiError(400,"No channel found")
    }

    const channel = await User.findOne({
        username:channelName?.toLowerCase()
    })
    if(!channel.length){
        throw new ApiError(400,'Channel not found')
    }

    const channelVideos = await Video.find({
        owner: channel._id
    }).populate('owner',"username avatar")

    if(!channelVideos.length){
        throw new ApiError(400, "No videos has been uploaded yet")
    }

    return res.status(200).json(
        new ApiResponse(200,channelVideos,"Channel videos fetched successfully ")
    )
})

const getAllVideos = asyncHandler(async(req,res)=>{
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const videos = await Video.find().populate('owner',"username avatar")

    if(!videos.length){
        throw new ApiError(400, "No videos has been uploaded yet")
    }   

    return res.status(200).json(
        new ApiResponse(200,videos,"Videos fetched successfully ")
    )
})
const updateVideo = asyncHandler(async(req,res)=>{
    const videoId = req.params?.videoId
    const {title,description} = req.body

    if(!title || !description){
        throw new ApiError(400,'All fields required')
    }

    const thumbnailLocalPath = req.file?.path

    if(!thumbnailLocalPath){
        throw new ApiError(400,'Thumbnail required')
    }

    const updateThumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    if(!updateThumbnail.url){
        throw new ApiError(500,'Something went wrong file uploading thumbnail')
    }

    const updateVideo = await Video.findOneAndUpdate(
        {
            _id: videoId,
            owner: req.user?._id,
        },
        {
            thumbnail: updateThumbnail.url,
            title: title,
            description:description,
        },
        {
            new:true
        }
    ) 

    if(!updateVideo){
        throw new ApiError(500,'Something went wrong while uploading the video in database')
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updateVideo,
            'Video updated successfully'
        )
    )
})

const deleteVideo = asyncHandler(async(req,res)=>{
    alert("Video once deleted can't be restored")
    const videoId = req.params?.videoId

    if(!videoId){
        throw new ApiError(400,'Video not found')
    }

    const video = await Video.findOneAndDelete(
        {
            _id: videoId,
            owner: req.user?._id,
        }
    )

    if(!video){
        throw new ApiError(500,"Something went wrong while deleting the video")
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Video is deleted successfully")
    )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    const video = await Video.findOne({
        _id:videoId,
        owner:req.user?._id
    })

    if(video.isPublished){
        video.isPublished = false    
    }else{
        video.isPublished = true  
    }

    await video.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,video,"Published status changed successfully")
    )

})
export {
    uploadVideo,
    getVideo,
    getAllVideos,
    channelVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}