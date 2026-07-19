import mongoose from 'mongoose'

const likeSchema = new mongoose.Schema({
    
    likedVideo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video',
        required:true,
        unique:true
    },

    userLiked:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    userDisliked:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
},{timestamps:true})

export const Like = mongoose.model('Like',likeSchema)