import express from 'express'
import {upload} from "../middlewares/multer.middleware.js"
import { channelVideos, deleteVideo, getAllVideos, getVideo, togglePublishStatus, updateVideo, uploadVideo } from '../controllers/video.controllers.js'

const videoRouter = express.Router()

videoRouter.post('/uploadVideo',upload.fields([
    {
        name:"videoFile",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
    
]), uploadVideo)

videoRouter.get('/',getAllVideos)

videoRouter.get('/:id',getVideo) // video by id

videoRouter.get('/:channelName',channelVideos)

videoRouter.patch('/:videoId',
    upload.single("thumbnail"),updateVideo)

videoRouter.delete('/:videoId',deleteVideo)

videoRouter.route("/toggle/publish/:videoId").patch(togglePublishStatus);
export default videoRouter