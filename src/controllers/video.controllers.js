import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const videos = await Video.find({ owner: userId });
    if (!videos) {
      throw new ApiError(404, "No videos found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting videos");
  }
});

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user._id;
  if (!title || !description) {
    throw new ApiError(400, "Title and description is required");
  }

  const videoLocalPath = req.files?.videoFile[0].path;
  const thumbnailLocalPath = req.files?.thumbnail[0].path;
  if (!videoLocalPath || !thumbnailLocalPath) {
    throw new ApiError(400, "Video and thumbnail is required");
  }

  let videoFile;
  try {
    videoFile = await uploadOnCloudinary(videoLocalPath);
  } catch (error) {
    throw new ApiError(500, "Failed to upload video");
  }
  let thumbnail;
  try {
    thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
  } catch (error) {
    throw new ApiError(500, "Failed to upload thumbnail");
  }

  try {
    const video = await Video.create({
      videoFile: {
        url: videoFile.url,
        public_id: videoFile.public_id,
      },
      thumbnail: {
        url: thumbnail.url,
        public_id: thumbnail.public_id,
      },
      title,
      description,
      owner: userId,
    });
    const createdVideo = await Video.findById(video._id);
    if (!createdVideo) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdVideo, "Video created successfully"));
  } catch (error) {
    if (videoFile) {
      await deleteFromCloudinary(videoFile.public_id);
    }
    if (thumbnail) {
      await deleteFromCloudinary(thumbnail.public_id);
    }
    throw new ApiError(500, "Something went wrong while creating video");
  }
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, video, "Video fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting video");
  }
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;
  const thumbnailLocalPath = req.file?.path;
  const userId = req.user._id;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  if (!title || !description) {
    throw new ApiError(400, "Title and description is required");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (String(video.owner) !== String(userId)) {
      throw new ApiError(400, "You cannot update this video");
    }
    await deleteFromCloudinary(video.thumbnail.public_id);

    let thumbnail;
    try {
      thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
    } catch (error) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          title,
          description,
          thumbnail: {
            url: thumbnail.url,
            public_id: thumbnail.public_id,
          },
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
  } catch (error) {
    if (thumbnail) {
      await deleteFromCloudinary(thumbnail.public_id);
    }
    throw new ApiError(500, "Something went wrong while updating video");
  }
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (String(video.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot delete this video");
    }
    if (video.videoFile.public_id) {
      await deleteFromCloudinary(video.videoFile.public_id);
    }
    if (video.thumbnail.public_id) {
      await deleteFromCloudinary(video.thumbnail.public_id);
    }
    const deletedVideo = await Video.findByIdAndDelete(videoId);

    return res
      .status(200)
      .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
  } catch (error) {}
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user?.id;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    let status;
    const video = await Video.findById(videoId);
    if (!video) {
      throw new ApiError(404, "Video not found");
    }
    if (String(video.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot update this video");
    }

    if (video.isPublished) {
      status = "unpublish";
      video.isPublished = false;
    } else {
      status = "publish";
      video.isPublished = true;
    }
    const updatedVideo = await Video.findByIdAndUpdate(
      videoId,
      {
        $set: {
          isPublished: video.isPublished,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedVideo, `Video ${status}ed successfully`)
      );
  } catch (error) {
    throw new ApiError(500, `Something went wrong while ${status}`);
  }
});

export {
  getAllVideos,
  publishVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
