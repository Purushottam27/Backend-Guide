import express from 'express'

import { verifyJWT } from '../middlewares/auth.middleware.js'
import { getLikedVideos} from '../controllers/like.contollers.js'

const likeRouter = express.Router()

likeRouter.get('/liked-videos',verifyJWT,getLikedVideos)

export default likeRouter