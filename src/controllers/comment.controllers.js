import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Comment } from "../models/comment.models.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }
  try {
    const comment = await Comment.find({ video: videoId });
    if (!comment) {
      throw new ApiError(404, "Video not found");
    }

    res
      .status(200)
      .json(new ApiResponse(200, comment, "Comments fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting comments");
  }
});

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;
  const userId = req.user._id;
  if (!videoId) {
    throw new ApiError(400, "Video id is required");
  }

  try {
    const comment = await Comment.create({
      content,
      video: videoId,
      owner: userId,
    });
    const createdComment = await Comment.findById(comment._id);
    if (!createdComment) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdComment, "Comment added successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while adding comment");
  }
});

const updateComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!content) {
    throw new ApiError(400, "Comment is required");
  }
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
    if (String(comment.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot update this comment");
    }
    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
      },
      {
        new: true,
      }
    );
    if (!updatedComment) {
      throw new ApiError(404, "Comment not found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, updatedComment, "Comment updated successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while updating comment");
  }
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const userId = req.user._id;
  if (!commentId) {
    throw new ApiError(400, "Comment id is required");
  }

  try {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, "Comment not found");
    }
    if (String(comment.owner) !== String(userId)) {
      throw new ApiError(403, "You cannot delete this comment");
    }
    const deletedComment = await Comment.findByIdAndDelete(commentId);

    return res
      .status(200)
      .json(
        new ApiResponse(200, deletedComment, "Comment deleted successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while deleting comment");
  }
});

export { getVideoComments, addComment, updateComment, deleteComment };
