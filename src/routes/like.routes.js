import { Router } from "express";
import {
  getAllLiked,
  toggleCommentLike,
  toggleVideoLike,
  toggleTweetLike,
} from "../controllers/like.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router.route("/video/:videoId").post(toggleVideoLike);
router.route("/comment/:commentId").post(toggleCommentLike);
router.route("/tweet/:tweetId").post(toggleTweetLike);
router.route("/videos").get(getAllLiked);

export default router;
