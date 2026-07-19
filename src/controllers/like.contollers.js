import mongoose from "mongoose";
import { Like } from "../models/like.model";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse";
import { asyncHandler } from "../utilis/asyncHandler.js";

// helper function
const ensureLikeDocument = async(videoId)=>{
    if(!videoId){
        throw new ApiError(400,'Video not found')
    }

    const video = await Like.findOne(
        {
            likedVideo:videoId
        }
    )

    if(!video){
        const createLikeDoc = await Like.create({
            likedVideo : videoId,
            userLiked: [],
            userDisliked: [],
        })
    }
    return 
}

const handleLike = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId

    if(!videoId){
        throw new ApiError(400,'Video not found')
    }
    
    // document exist or not
    await ensureLikeDocument(videoId)

    const removeLike =  await Like.findOneAndUpdate(
        {
            likedVideo:videoId,
            userLiked : req.user?._id // it means user already liked the video
        },
        {
            $pull:{
                userLiked : req.user?._id
            }
        },
        {
            new:true
        }
    )

    if(!removeLike){ // user has not liked the video yet
        const addLike = await Like.findOneAndUpdate(
            {
                likedVideo:videoId
            },
            {
                $pull:{
                    userDisliked : req.user?._id
                },
                $addToSet:{
                    userLiked:req.user?._id
                }
            },
            {
                new:true
            }
        )

        if(!addLike){
            throw new ApiError(400,'Like count not updated')
        }

        return res.status(200).json(
            new ApiResponse(200,likeDetails, "Video liked successfully")
        )
    }else{
       
        return res.status(200).json(
            new ApiResponse(200,removeLike, "Removed like successfully")
        )
    }
})

const handleDislike = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId

    if(!videoId){
        throw new ApiError(400,'Video not found')
    }
    
    await ensureLikeDocument(videoId)

    const removeDislike =  await Like.findOneAndUpdate(
        {
            likedVideo:videoId,
            userDisliked : req.user?._id // it means user already disliked the video
        },
        {
            $pull:{
                userDisliked : req.user?._id
            }
        },
        {
            new:true
        }
    )

    if(!removeDislike){ // user has not disliked the video yet
        const addDislike = await Like.findOneAndUpdate(
            {
                likedVideo:videoId
            },
            {
                $pull:{
                    userLiked : req.user?._id
                },
                $addToSet:{
                    userDisliked:req.user?._id
                }
            },
            {
                new:true
            }
        )

        if(!addDislike){
            throw new ApiError(400,'Like count not updated')
        }

        return res.status(200).json(
            new ApiResponse(200,addDislike, "Video unliked successfully")
        )
    }else{
       
        return res.status(200).json(
            new ApiResponse(200,removeDislike, "Removed the unlike successfully")
        )
    }
})

const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id


    const videoInfo = await Like.aggregate([
        // 1. Get all Like documents where the current user liked the video
        {
            $match:{
                userLiked: new mongoose.Types.ObjectId(userId)
            }
        },
        // 2. Join the Video document
        {
            $lookup:{
                from:'videos',
                localField:'likedVideo',
                foreignField:'_id',
                as:'video',
                pipeline:[
                    // 3. Join the Owner(User) document
                    {
                        $lookup:{
                            from:'users',
                            localField:'owner',
                            foreignField:'_id',
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner:{
                                $first:'$owner'
                            }
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        },
        // Return only the video document
        {   // with these we have just removed video: {}to only {} 
            $replaceRoot: { 
                newRoot: "$video"
            }
        }
        // so now only the array passed look like 
        // [  after that we can aaply map and extract
        //   {   video.title or video.owner.username
        //     title,
        //     owner:{}
        //   },
        //   {}
        // ]
    ])

    if(!videoInfo.length){
        throw new ApiError(500,'Something went wrong while fetching the liked videos')
    }

    return res.status(200).json(
        new ApiResponse(200,videoInfo,"Liked videos fetched successfully")
    )
})

export {
    handleLike,
    handleDislike,
    getLikedVideos
}