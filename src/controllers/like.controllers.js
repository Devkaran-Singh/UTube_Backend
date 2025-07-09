import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Like } from "../models/like.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const userId = req.user._id;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const video = await Like.find({ video: videoId });
    let status;
    if (video.length === 0) {
      status = "like";
      const newLike = await Like.create({ video: videoId, likedBy: userId });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { newLike }, `Video ${status}d successfully`)
        );
    } else {
      status = "unlike";
      const deletedLike = await Like.findByIdAndDelete(video[0]._id);
      return res
        .status(200)
        .json(
          new ApiResponse(200, { deletedLike }, `Video ${status}d successfully`)
        );
    }
  } catch (error) {
    throw new ApiError(500, `Something went wrong`);
  }
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  try {
    const comment = await Like.find({ comment: commentId });
    let status;
    if (comment.length === 0) {
      status = "like";
      const newLike = await Like.create({
        comment: commentId,
        likedBy: userId,
      });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { newLike }, `Comment ${status}d successfully`)
        );
    } else {
      status = "unlike";
      const deletedLike = await Like.findByIdAndDelete(comment[0]._id);
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { deletedLike },
            `Comment ${status}d successfully`
          )
        );
    }
  } catch (error) {
    throw new ApiError(500, `Something went wrong`);
  }
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }

  try {
    const tweet = await Like.find({ tweet: tweetId });
    let status;
    if (tweet.length === 0) {
      status = "like";
      const newLike = await Like.create({ tweet: tweetId, likedBy: userId });
      return res
        .status(200)
        .json(
          new ApiResponse(200, { newLike }, `Tweet ${status}d successfully`)
        );
    } else {
      status = "unlike";
      const deletedLike = await Like.findByIdAndDelete(tweet[0]._id);
      return res
        .status(200)
        .json(
          new ApiResponse(200, { deletedLike }, `Tweet ${status}d successfully`)
        );
    }
  } catch (error) {
    throw new ApiError(500, `Something went wrong`);
  }
});

const getAllLiked = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  try {
    const videos = await Like.find({ likedBy: userId });
    if (!videos) {
      throw new ApiError(404, "No liked videos found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videos, "Liked items fetched successfully"));
  } catch (error) {
    throw new ApiError(500, `Something went wrong while getting liked videos`);
  }
});

export { toggleCommentLike, toggleTweetLike, toggleVideoLike, getAllLiked };
