import express from 'express'
import { addComment, deleteComment, editComment, getComments, pinComment } from '../controllers/comment.controllers'

const commentRouter = express.Router()
commentRouter.post('/make-comment/video/:videoId',addComment)

commentRouter.get('/video/:videoId',getComments)

commentRouter.patch('/edit-comment/:commentId',editComment)

commentRouter.delete('/delete-comment/:commentId',deleteComment)

commentRouter.post('/pin-comment/commentId',pinComment)
export default commentRouter