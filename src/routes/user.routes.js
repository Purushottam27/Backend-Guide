import express from 'express'
import { changePassword, getCurrentUser, getUserChannelProfile, getWatchedHistory, loginUser, logoutUser, refreshAccessToken, registerUser, updateProfileDetails, updateUserAvatar, updateUserCoverImage } from '../controllers/user.controllers.js'
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
router.get('/user',verifyJWT,getCurrentUser) 
router.post('/changePassword',verifyJWT,changePassword) 
router.patch('/updateProfile',verifyJWT,updateProfileDetails)

// we have to use the multer middleware to provide the file details through upload and as we only want one file so use single method.
router.patch('/updateAvatar',verifyJWT,upload.single("avatar"),updateUserAvatar) 
router.patch('/updateCoverImage',verifyJWT,upload.single("coverImage"),updateUserCoverImage) 

router.post('/channel/:username',verifyJWT,getUserChannelProfile),
router.post('/watchHistory',verifyJWT,getWatchedHistory)

export default router