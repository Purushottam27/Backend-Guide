import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const makeTweet = asyncHandler(async(req,res)=>{
    const {tweetMessage} = req.body

    if(tweetMessage.trim()){
        throw new ApiError(400,'Tweet cannot be empty')
    }

    const tweet = await Tweet.create({
        tweetMessage:tweetMessage,
        owner:req.user?._id
    })

    if(!tweet){
        throw new ApiError(400,'Something went wrong while making tweet')
    }

    return res.status(200).json(
        new ApiResponse(200,{},"You have made a amazing tweet")
    )
})

const getTweets = asyncHandler(async(req,res)=>{

    const tweet = await Tweet.find().populate("owner","username avatar")

    if(!tweet){
        throw new ApiError(200,"No tweet yet")
    }

    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweets are fetched successfully")
    )
})

const getUserTweet = asyncHandler(async(req,res)=>{
    const userId = req.user?._id

    const tweet = await Tweet.find({
        owner:userId
    }).populate("owner","username avatar")

    if(!tweet){
        throw new ApiError(200,"you have not tweeted yet")
    }

    return res.status(200).json(
        new ApiResponse(200,tweet,"User tweet is fetched successfully")
    )
})

const editTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.tweetId
    const {tweetMessage} = req.body

    if(tweetMessage.trim()){
        throw new ApiError(400,'Tweet cannot be empty')
    }

    const tweet = await Tweet.findOneAndUpdate(
        {
            _id:tweetId,
            owner:req.user?._id
        },
        {
            tweetMessage:tweetMessage
        },
        {
            new:true
        },
    )

    if(tweet === null){
        throw new ApiError(400,'You have no right to edit these')
    }

    return res.status(200).json(
        new ApiResponse(200,tweet,"Tweet edited successfully")
    )
})

const deleteTweet = asyncHandler(async(req,res)=>{
    const tweetId = req.params.tweetId

    const tweet = await Tweet.findOneAndDelete(
        {
            _id:tweetId,
            owner:req.user?._id
        }
    )

    if(tweet === null){
        throw new ApiError(400,'You have no right to edit these')
    }

    return res.status(200).json(
        new ApiResponse(200,{},"Tweet deleted successfully")
    ) 
})

export {
    makeTweet,
    getTweets,
    getUserTweet,
    editTweet,
    deleteTweet
}