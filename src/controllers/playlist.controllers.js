import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utilis/apiError.js";
import { ApiResponse } from "../utilis/apiResponse.js";
import { asyncHandler } from "../utilis/asyncHandler.js";

const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body

    if(!name || !description){
        throw new ApiError(400,"All fields required")
    }

    const playlist = await Playlist.create({
        name:name,
        description:description,
        owner:req.user?._id,
        playlistVideos:[]
    })

    if(!playlist){
        throw new ApiError(400,"Something went wrong while creating the playlist")
    }

    return req.status(200).json(
        new ApiResponse(200,playlist,"Playlist created successfully")
    )
})

const getPlaylistById = asyncHandler(async(req,res)=>{
    const playlistId = req.params.playlistId

    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id:playlistId
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'playlistVideos',
                foreignField:'_id',
                as:'videoInfo'
            }
        },
        {
            $addFields:{
                videoInfo:{
                    $first:'videoInfo'
                }
            }
        }
    ])

    if(!playlist.length){
        throw new ApiError(400,"Playlist not found")
    }

    return req.status(200).json(
        new ApiResponse(200,playlist[0],"Playlist fetched successfully") // now i get the obj itself 
    )
})

const getUserPlaylists = asyncHandler(async(req,res)=>{
    const userId = req.params.userId

    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner:userId
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'playlistVideos',
                foreignField:'_id',
                as:'videoInfo'
            }
        },
        {
            $addFields:{
                videoInfo:{
                    $first:'videoInfo'
                }
            }
        }
    ])

    if(!playlists.length){
        throw new ApiError(400,"No playlist found")
    }

    return req.status(200).json(
        new ApiResponse(200,playlists,"All Playlist fetched successfully") // here we get the array of obj 
    )
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.playlistId
    const {name,description} = req.body

    if(!name || !description){
        throw new ApiError(400,"All fields required")
    }

    const playlist = await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user?._id
        },
        {
            name:name,
            description:description,
        },
        {
            new:true
        }
    )

    if(!playlist){
        throw new ApiError(400,"Something went wrong while creating the playlist")
    }

    return req.status(200).json(
        new ApiResponse(200,playlist,"Playlist updated successfully")
    )
})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const playlistId = req.params.playlistId

    await Playlist.findOneAndDelete(
        {
            _id:playlistId,
            owner:req.user?._id
        }
    )
    return req.status(200).json(
        new ApiResponse(200,playlist,"Playlist deleted successfully")
    )
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params

    const addVideo = await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user?._id
        },
        {
            $addToSet:{
                playlistVideos : videoId
            }
        },
        {
            new:true
        }
    )

    if(!addVideo){
        throw new ApiError(400,'Something went wrong while adding the video')
    }

    return req.status(200).json(
        new ApiResponse(200,addVideo,"Video added to the playlist successfully")
    )
})

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {playlistId,videoId} = req.params

    const removeVideo = await Playlist.findOneAndUpdate(
        {
            _id:playlistId,
            owner:req.user?._id
        },
        {
            $pull:{
                playlistVideos:videoId
            }
        },
        {
            new:true
        }
    )

    if(!removeVideo){
        throw new ApiError(400,'Something went wrong while removing the video')
    }

    return req.status(200).json(
        new ApiResponse(200,removeVideo,"Video removed from playlist successfully")
    )
})

export {
    createPlaylist,
    getPlaylistById,
    getUserPlaylists,
    updatePlaylist,
    deletePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist
}