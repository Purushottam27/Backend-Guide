import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const addComment = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId
    const {commentMessage} = req.body

    if(!commentMessage.trim()){
        throw new ApiError(400,"Send a valid content")
    }

    const comment = await Comment.create({
        video:videoId,
        userCommented:req.user?._id,
        commentMessage:commentMessage
    })

    if(!comment){
        throw new ApiError(400,"Something went wrong while creating a comment")
    }

    return res.status(200).json(
        new ApiResponse(200,comment,"Comment is created successfully")
    )
})

const getComments = asyncHandler(async(req,res)=>{
    const videoId = req.params.videoId
    const {page = 1, limit = 10} = req.query
    
    const comment = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"userCommented",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username: 1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"likes",
                localField:"_id",
                foreignField:"commentLiked",
                as:"likeDetails",
            }
        },
        {
            $addFields:{
                owner:{
                    $first:'$owner'
                },
                totalLikes:{
                    $size:"$likeDetails"
                },
                isLiked:{
                    $cond:{
                        if: req.user?._id === "$likeDetails.likedBy",
                        then: true,
                        else:false
                    }
                }
            }
        }
    ])
    if(!comment.length){
        throw new ApiError(400,'Comments not found')
    }

    return res.status(200).json(
        new ApiResponse(200,comment,"All the comments fetched successfully")
    )
})

const editComment = asyncHandler(async(req,res)=>{
    const commentId = req.params.commentId
    const {commentMessage} = req.body

    if(!commentMessage.trim()){
        throw new ApiError(400,"Send a valid content")
    }

    const comment = await Comment.findOne({
        _id: commentId,
    })
    if(comment.userCommented !== req.user?._id){
        throw new ApiError(400,"You have no right to edit these comment")
    }

    const updatedComment = await Comment.findOneAndUpdate(
        {
            _id: commentId,
            userCommented:req.user?._id,
        },
        {
            commentMessage:commentMessage,
            isEdited:true
        },
        {
            new:true
        }
    )

    if(!updatedComment){
        throw new ApiError(400,"Something went wrong while updating comment")
    }

    return res.status(200).json(
        new ApiResponse(200,updatedComment,"Comment is created successfully")
    )
})

const deleteComment = asyncHandler(async(req,res)=>{
    const commentId = req.params.commentId

    const comment = await Comment.findOne({
        _id: commentId,
    })
    if(comment.userCommented !== req.user?._id){
        throw new ApiError(400,"You have no right to delete these comment")
    }

    await Comment.findOneAndDelete({
        _id: commentId,
        userCommented:req.user?._id
    })

    return res.status(200).json(
        new ApiResponse(200,{},"Comment is deleted successfully")
    )
})

const pinComment = asyncHandler(async(req,res)=>{
    // comment is pinned only the user who had commented 
    const commentId = req.params.commentId
    const userId = req.user?._id

    const commentVideoInfo = await Comment.findOne({
        _id:commentId
    }).populate('video','owner').populate("userCommented", "username avatar")

    if(commentVideoInfo.video[0].owner !== userId){
        throw new ApiError(400,'Rights are resereved')
    }

    commentVideoInfo.isPinned = true;
    await commentVideoInfo.save({validateBeforeSave:false})

    return res.status(200).json(
        new ApiResponse(200,commentVideoInfo,"Comment is pinned at the top")
    )
})
export {
    getComments,
    addComment,
    editComment,
    deleteComment,
    pinComment
}