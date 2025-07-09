import { Router } from "express";
import {
  getSubscribedChannels,
  getSubscribersForChannel,
  toggleSubscription,
} from "../controllers/subscription.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();
router.use(verifyJWT);

router
  .route("/channel/:channelId")
  .get(getSubscribersForChannel)
  .post(toggleSubscription);
router.route("/subscriber/:subscriberId").get(getSubscribedChannels);

export default router;
