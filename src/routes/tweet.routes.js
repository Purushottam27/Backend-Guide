import express from 'express'

import { verifyJWT } from '../middlewares/auth.middleware.js'
import { deleteTweet, editTweet, getTweets, getUserTweet, makeTweet } from '../controllers/tweet.controllers.js'


const tweetRouter = express.Router()

tweetRouter.post('/make-tweet',makeTweet)

tweetRouter.get('/',getTweets)

tweetRouter.get('/user/:userId',getUserTweet)

tweetRouter.patch('/edit-tweet/:tweetId',editTweet)

tweetRouter.delete('/delete-tweet/:tweetId',deleteTweet)


export default tweetRouter