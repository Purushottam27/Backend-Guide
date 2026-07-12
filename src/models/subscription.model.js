import mongoose, { model } from 'mongoose'

const subscriptionSchema = new mongoose.Schema({
    subscriber:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{ // user to whom the subscriber is subscribing
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }
},{timestamps:true})

export const Subscription = mongoose.model('Subscription',subscriptionSchema)