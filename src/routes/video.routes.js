import express from 'express'
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js'
import { channelVideos, getVideo, uploadVideo } from '../controllers/video.controllers.js'

const videoRouter = express.Router()

videoRouter.post('/uploadVideo',verifyJWT,upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
    
]), uploadVideo)

videoRouter.get('/:id',verifyJWT,getVideo)

videoRouter.get('/channel/:channelName',verifyJWT,channelVideos)




export default videoRouter