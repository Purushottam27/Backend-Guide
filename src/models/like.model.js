import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema({
    
    likedVideo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video',
        required:true,
    },

    likedBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },

    commentLiked:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
    },

    tweetLiked:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tweet",
    },

},{timestamps:true})

export const Like = mongoose.model('Like',likeSchema)