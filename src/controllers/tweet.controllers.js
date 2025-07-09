import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const userId = req.user._id;
  if (!content) {
    throw new ApiError(400, "Tweet is required");
  }

  try {
    const tweet = await Tweet.create({
      content,
      owner: userId,
    });
    const createdTweet = await Tweet.findById(tweet._id);
    if (!createdTweet) {
      throw new ApiError(500, "Something went wrong");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdTweet, "Tweet created successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while creating tweet");
  }
});

const getUserTweets = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      throw new ApiError(400, "User id is required");
    }
    const tweets = await Tweet.find({ owner: userId });
    if (!tweets) {
      throw new ApiError(404, "No tweets found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting tweets");
  }
});

const updateTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!content) {
    throw new ApiError(400, "Tweet is required");
  }
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const tweet = await Tweet.findById(tweetId);
    if (String(tweet.owner) !== String(userId)) {
      throw new ApiError(400, "You cannot update this tweet");
    }
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
      tweetId,
      {
        $set: {
          content,
        },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while updating tweet");
  }
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const userId = req.user._id;
  if (!tweetId) {
    throw new ApiError(400, "Tweet id is required");
  }
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const tweet = await Tweet.findById(tweetId);
    if (String(tweet.owner) !== String(userId)) {
      throw new ApiError(400, "You cannot delete this tweet");
    }
    if (!tweet) {
      throw new ApiError(404, "Tweet not found");
    }
    const deletedTweet = await Tweet.findByIdAndDelete(tweetId);

    return res
      .status(200)
      .json(new ApiResponse(200, deleteTweet, "Tweet deleted successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while deleting tweet");
  }
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
