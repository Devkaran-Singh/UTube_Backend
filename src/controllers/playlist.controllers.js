import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Playlist } from "../models/playlist.models.js";
import { Video } from "../models/video.models.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const userId = req.user._id;
  if (!name || !description) {
    throw new ApiError(400, "Name and description is required");
  }

  try {
    const playlist = await Playlist.create({
      name,
      description,
      owner: userId,
    });
    const createdPlaylist = await Playlist.findById(playlist._id);
    if (!createdPlaylist) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, createdPlaylist, "Playlist created successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating playlist");
  }
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const playlist = await Playlist.find({ owner: userId });
    if (!playlist) {
      throw new ApiError(404, "Playlists not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlists fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting playlist");
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting playlist");
  }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;
  const userId = req.user._id;
  if (!playlistId || !videoId) {
    throw new ApiError(400, "Playlist id and video id is required");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (String(playlist.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot add video to this playlist");
    }
    playlist.videos.push(videoId);
    await playlist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, playlist, "Video added to playlist successfully")
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while adding video to playlist"
    );
  }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { videoId } = req.body;
  const userId = req.user._id;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    const video = await Video.findById(videoId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (String(playlist.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot remove video from this playlist");
    }
    playlist.videos.pull(videoId);
    await playlist.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          playlist,
          "Video removed from playlist successfully"
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while removing video from playlist"
    );
  }
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const userId = req.user._id;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (String(playlist.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot delete this playlist");
    }
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while deleting playlist");
  }
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  const userId = req.user._id;
  if (!playlistId) {
    throw new ApiError(400, "Playlist id is required");
  }
  if (!name || !description) {
    throw new ApiError(400, "Name and description is required");
  }

  try {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      throw new ApiError(404, "Playlist not found");
    }
    if (String(playlist.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot update this playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      {
        $set: {
          name,
          description,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while updating playlist");
  }
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
};
