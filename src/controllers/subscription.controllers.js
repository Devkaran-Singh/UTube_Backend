import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.models.js";

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  const userId = req.user._id;
  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }
  if (String(channelId) === String(userId)) {
    throw new ApiError(400, "You cannot subscribe to yourself");
  }
  const channel = Subscription.findById(channelId);
  if (!channel) {
    throw new ApiError(404, "Channel not found");
  }

  try {
    const existingSubscriber = await Subscription.findOne({
      channel: channelId,
      subscriber: userId,
    });
    let action = "";
    if (existingSubscriber) {
      await existingSubscriber.deleteOne({ subscriber: userId });
      action = "unsubscribed";
    } else {
      await Subscription.create({
        channel: channelId,
        subscriber: userId,
      });
      action = "subscribed";
    }
    return res
      .status(200)
      .json(new ApiResponse(200, action, `Channel succesfully ${action}`));
  } catch (error) {
    throw new ApiError(500, "Something went wrong while toggling subscription");
  }
});

const getSubscribersForChannel = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!channelId) {
    throw new ApiError(400, "Channel id is required");
  }

  try {
    const subscribers = await Subscription.find({ channel: channelId });
    if (!subscribers) {
      throw new ApiError(404, "No subscribers found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting subscribers");
  }
});

const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;
  if (!subscriberId) {
    throw new ApiError(400, "Subscriber id is required");
  }

  try {
    const channels = await Subscription.find({ subscriber: subscriberId });
    if (!channels) {
      throw new ApiError(404, "No subscribed channels found");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          channels,
          "Subscribed Channels fetched successfully"
        )
      );
  } catch (error) {
    throw new ApiError(500, "Something went wrong while getting channels");
  }
});

export { toggleSubscription, getSubscribersForChannel, getSubscribedChannels };
