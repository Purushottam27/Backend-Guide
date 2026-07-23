import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const likeVideo = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId

    if(!videoId){
        throw new ApiError(400,'Video not found')
    }

    // agar phle se like hai to us like ko hata do
    const like =  await Like.findOne(
        {
            likedVideo:videoId,
            likedBy : req.user?._id // it means user already liked the video
        }
    )

    if(!like){ // user has not liked the video yet 
        const addLike = await Like.create(
            {
                likedVideo:videoId,
                likedBy:req.user?._id
            }
        )

        return res.status(200).json(
            new ApiResponse(200,addLike, "Video liked successfully")
        )
    }

    await Like.findOneAndDelete({
        likedVideo:videoId,
        likedBy:req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200,{}, "Removed like successfully")
    )
})

const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id


    const videoInfo = await Like.aggregate([
        // 1. Get all Like documents where the current user liked the video
        {
            $match:{
                likedBy: new mongoose.Types.ObjectId(userId)
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
                                    $project:{ // channel ka username and avatar leke aye
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

const likeComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    // first need to check does the comment is already liked by the user or not
    const like = await Like.findOne({
        likedBy: req.user?._id,
        commentLiked:commentId
    })

    // now if user had not found means he had not liked yet
    if(!like){
        const likeComment = await Like.create({
            likedBy: req.user?._id,
            commentLiked:commentId
        })
        return res.status(200).json(
            new ApiResponse(200,likeComment,"User liked the comment")
        )
    }

    // if user aready had liked the comment then remove the like
    await Like.findOneAndDelete({
        likedBy: req.user?._id,
        commentLiked:commentId
    })
    return res.status(200).json(
        new ApiResponse(200,{},"User unliked the comment")
    )
})

const likeTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    // first need to check does the tweet is already liked by the user or not
    const like = await Like.findOne({
        likedBy: req.user?._id,
        tweetLiked:tweetId
    })

    // now if user had not found means he had not liked yet so like the tweet and create its documnet which contain only likedBy and tweetLiked id
    if(!like){
        const likedTweet = await Like.create({
            likedBy: req.user?._id,
            tweetLiked:tweetId
        })
        return res.status(200).json(
            new ApiResponse(200,likedTweet,"User liked the tweet")
        )
    }

    // if user aready had liked the comment then remove the like
    await Like.findOneAndDelete({
        likedBy: req.user?._id,
        tweetLiked:tweetId
    })
    return res.status(200).json(
        new ApiResponse(200,{},"User unliked the tweet")
    )
})

export {
    likeVideo,
    getLikedVideos,
    likeComment,
    likeTweet
}