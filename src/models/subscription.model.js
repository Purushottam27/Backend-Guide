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

 // we can make it an array as there are multiple subscriber for the same channel but we have not done these because if any subscriber unscribed the channel then it was hard to rearrange the milloins of data so intead we spreately created a mode for these in which when ever the any subscriber subscribe the channel then its document is been created which contain channel userid and subscriber id so suppose we need how many subscriber does chai aur code channel had so we count the document where the channel name is chai aur code and if we want that how many channel does puru had subscribed then we count subscriber name puru these was the logic behind seprately creating these model not creating it array type
export const Subscription = mongoose.model('Subscription',subscriptionSchema)