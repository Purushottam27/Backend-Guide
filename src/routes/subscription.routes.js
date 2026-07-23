import express from 'express'
import { getChannelSubscribers, getSubscribedChannel, toggleSubscription } from '../controllers/subscription.controllers'
import { Subscription } from '../models/subscription.model'

const subscriptionRouter = express.Router()

subscriptionRouter.post('/subscribe-channel/:channelId',toggleSubscription)

subscriptionRouter.get('/channel/subscriber-list/:channelId',getChannelSubscribers)

subscriptionRouter.get('/subscribed-channels/:subscriberId',getSubscribedChannel)

export default subscriptionRouter