import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.models.js";
import { Subscription } from "../models/subscription.models.js";
import { Like } from "../models/like.models.js";

const getChannelStats = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const totalVideos = await Video.countDocuments({ owner: userId });
    const videoViews = await Video.aggregate([
      {
        $match: {
          owner: new mongoose.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: null,
          totalViews: {
            $sum: "$views",
          },
        },
      },
    ]);

    const totalViews = videoViews[0]?.totalViews || 0;
    const totalSubscribers = await Subscription.countDocuments({
      channel: userId,
    });
    const videoIds = await Video.find({ owner: userId }).distinct("_id");
    const totalLikes = await Like.countDocuments({
      video: { $in: videoIds },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalViews, totalVideos, totalSubscribers, totalLikes },
          "Channel stats fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting channel stats");
  }
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(400, "User id is required");
  }

  try {
    const videoIds = await Video.find({ owner: userId }).distinct("_id");
    if (!videoIds) {
      throw new ApiError(404, "Videos not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, videoIds, "Videos fetched successfully"));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting videos");
  }
});

export { getChannelStats, getChannelVideos };
