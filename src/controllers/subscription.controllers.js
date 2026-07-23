import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const toggleSubscription = asyncHandler(async(req,res)=>{
    const channelId = req.params.channelId

    // phle ye check kro ge doc phle se to exist ni krta
    const subscribed = await Subscription.findOne({
        subscriber:req.user?._id,
        channel:channelId
    })

    // agar ni krta to create kr do and subscription button ko on kr do
    if(!subscribed){
        const subscribed = await Subscription.create({
            subscriber:req.user?._id,
            channel:channelId
        })
        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    subscribed:subscribed,
                    isSubscribed:true
                },
                "Channel is unsubscribed"
            )
        )
    }

    // or agar doc hai matlab already subscribed kr rakha hai to unsubscribe kr do or doc delete kr do
    const subscribed = await Subscription.findOneAndDelete({
        subscriber:req.user?._id,
        channel:channelId
    })

    return res.status(200).json(
        new ApiResponse(200,{isSubscribed:false},"Channel is unsubscribed")
    )
})

// controller to return subscriber list of a channel
const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const channelId = req.params.channelId

    const channelSub = await Subscription.find({
        channel : channelId
    }).populate('subscriber','fullname avatar').select('-_id -channel')

    if(!channelSub.length){
        throw new ApiError(400,"No subscriber found")
    }

    return res.status(200).json( 
        new ApiResponse(200,channelSub,"Subscriber list fetched successfully")
    ) // channelSub me loop lagye ge then subs.subscriber.fullname access kre ge
})

// controller to return channel list to which user has subscribed
const getSubscribedChannel = asyncHandler(async(req,res)=>{
    const subscriberId = req.params.subscriberId

    const channelSubscribed = await Subscription.find({
        subscriber : subscriberId
    }).populate('channel', 'username avatar coverImage').select('-_id -subscriber')

    if(!channelSubscribed.length){
        throw new ApiError(400,"No channel found")
    }

    return res.status(200).json(
        new ApiResponse(200,channelSubscribed,"Channel list fetched successfully")
    )   
})

export {
    toggleSubscription,
    getChannelSubscribers,
    getSubscribedChannel
}