import express from "express";
import {
  getPosts,
  createPost,
  getSinglePost,
  likePost,
  fetchLikeList,
  fetchUserPosts,
} from "../controllers/posts.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", auth, createPost);
router.get("/user/:id", fetchLikeList);
router.get("/post/:postId", getSinglePost);
router.patch("/:id/likePost", auth, likePost);
router.get("/user/uploaded/:id", fetchUserPosts);

export default router;
