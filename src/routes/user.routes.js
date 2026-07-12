import express from 'express'
import { loginUser, logoutUser, refreshAccessToken, registerUser } from '../controllers/user.controllers.js'
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/register',
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

router.post('/login',loginUser)

// secure route:
router.post('/logout',verifyJWT,logoutUser)
router.post('/refreshToken',refreshAccessToken) // refresh token endpoint


export default router