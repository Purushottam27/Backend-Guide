import mongoose from "mongoose";
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const commentSchema = new mongoose.Schema({
    video : {
        type: mongoose.Schema.Types.ObjectId,
        ref:"Video",
        required:true
    }, 
    userCommented : {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    commentMessage:{
        type:String,
        required:true,
        trim:true
    },
    // agar jo chig hamne kari vo sab ko dikhni chiye to ham isEdited and isPinned ko database me store kr te hai and if it is a thing that you will only see then we compute it while doing like isSubscribed or isLiked these thing you can only see not all so there is different value for different user.
    isEdited:{
        type:Boolean,
        default:false
    },
    isPinned: {
        type: Boolean,
        default: false
    }

},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model('Comment',commentSchema)
