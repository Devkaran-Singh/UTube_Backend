import { Router } from "express";
import {
  addComment,
  deleteComment,
  getVideoComments,
  updateComment,
} from "../controllers/comment.controllers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.use(verifyJWT);

router.route("/:videoId").get(getVideoComments).post(addComment);
router.route("/:commentId").delete(deleteComment).patch(updateComment);

export default router;
