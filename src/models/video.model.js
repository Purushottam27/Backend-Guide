import mongoose from 'mongoose'
import aggregatePagination from 'mongoose-paginate-v2'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'
const videoSchema = new mongoose.Schema({
    videoFile:{
        type:String, // cloudinary url
        required:true,
    },
    thumbnail:{    // cloudinary url
        type:String,
        required:true,
    },
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    views:{
        type:Number,
        default:0,
        required:true,
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    duration:{  // cloudinary he beje ga video ka duration bhi
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    }
},{timestamps:true})

videoSchema.plugin(aggregatePagination);  // these we used with normal find() query 
videoSchema.plugin(mongooseAggregatePaginate) //  these we used with the advance query we use these in these project

export const Video = mongoose.model('Video',videoSchema)