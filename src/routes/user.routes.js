import express from 'express'
import { changePassword, getCurrentUser, getUserProfileDetails, loginUser, logoutUser, refreshAccessToken, registerUser, updateProfileDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controllers.js'
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
router.post('/refreshToken',refreshAccessToken) // refresh token endpoint no need of verify JWT middleware.
router.post('/changePassword',verifyJWT,changePassword) 
router.post('/updateProfile',verifyJWT,updateProfileDetails) 
router.post('/updateAvatar',verifyJWT,updateUserAvatar) 
router.post('/updateCoverImage',verifyJWT,updateUserCoverImage) 
router.get('/user',verifyJWT,getCurrentUser) 
router.post('/profile',verifyJWT,getUserProfileDetails) 

export default router