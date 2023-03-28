import express from "express";
import {
  getPosts,
  createPost,
  updatePost,
  deletePost,
  likePost,
  getPostsBySearch,
  getSinglePost,
} from "../controllers/posts.js";

import auth from "../middleware/auth.js";

const router = express.Router();

// these routes are actually using the base URL "/posts" which is why we're getting from "localhost:5000/ports" in the client

router.get("/search", getPostsBySearch);
router.get("/:id", getSinglePost);
router.get("/", getPosts);
router.post("/", auth, createPost);
router.patch("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
// auth is called then goes next to the likePost function
router.patch("/:id/likePost", auth, likePost);
// router.get and router.post are assigning the get and post methods for the front end through getPosts and createPosts

export default router;

// so when i use axios.get, the backend knows which function to use for get because i defined it as "router.get("/", getPosts);"?

// Yes, that's correct. When you make a GET request to the server using the URL http://localhost:5000/posts, it matches the route defined as router.get("/", getPosts) because the URL contains only the base URL and no additional paths. The getPosts function is then called to handle the request and return the requested data.
