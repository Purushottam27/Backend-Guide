import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()

app.use(express.json({limit:'16kb'}))
app.use(express.urlencoded({extended:false,limit:'16kb'}))
app.use(cookieParser())
app.use(cors({
    origin:process.env.CORS_ORIGIN,   // to allow only specific url from the frontend 
    credentials:true,
}))
app.use(express.static('public'))
// app.use(express.static(path.join(__dirname, "public")));

import { verifyJWT } from './middlewares/auth.middleware.js'
// Routes:
import userRouter from './routes/user.routes.js'
import videoRouter from './routes/video.routes.js'
import likeRouter from './routes/like.routes.js'
import tweetRouter from './routes/tweet.routes.js'
import playlistRouter from './routes/playlist.routes.js'
import commentRouter from './routes/comment.routes.js'
import subscriptionRouter from './routes/subscription.routes.js'


app.use('/api/v1/users',userRouter)
app.use('/api/v1/videos',verifyJWT,videoRouter)
app.use('/api/v1/likes',verifyJWT,likeRouter)
app.use('/api/v1/tweets',verifyJWT,tweetRouter)
app.use('/api/v1/playlists',verifyJWT,playlistRouter)
app.use('/api/v1/comments',verifyJWT,commentRouter)
app.use('/api/v1/subscription',verifyJWT,subscriptionRouter)

export {app}