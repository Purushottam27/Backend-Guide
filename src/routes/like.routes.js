import express from 'express'

import { getLikedVideos, likeComment, likeTweet, likeVideo} from '../controllers/like.contollers.js'

const likeRouter = express.Router()

likeRouter.post('/toggle/video/:videoId',likeVideo)
likeRouter.post('/toggle/comment/:commentId',likeComment)
likeRouter.post('/toggle/tweet/:tweetId',likeTweet)
likeRouter.get('/liked-videos',getLikedVideos)

export default likeRouter