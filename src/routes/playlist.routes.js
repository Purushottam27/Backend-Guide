import express from 'express'
import { addVideoToPlaylist, createPlaylist, deletePlaylist, getPlaylistById, getUserPlaylists, removeVideoFromPlaylist, updatePlaylist } from '../controllers/playlist.controllers'

const playlistRouter = express.Router()

playlistRouter.post('/',createPlaylist)

playlistRouter.get('/user/:userId',getUserPlaylists)

playlistRouter.get('/playlist/:playlistId',getPlaylistById)

playlistRouter.patch('/update-playlist/:playlistId',updatePlaylist)

playlistRouter.delete('/delete-playlist/:playlistId',deletePlaylist)

playlistRouter.patch('/add/:videoId/:playlistId',addVideoToPlaylist)

playlistRouter.patch('/remove/:videoId/:playlistId',removeVideoFromPlaylist)



export default playlistRouter
