import PostMessage from "../models/postMessage.js";
import playList from "../models/playList.js";
import mongoose from "mongoose";

export const getPosts = async (req, res) => {
  // const { page } = req.query;
  const posts = await PostMessage.find();
  try {
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};
export const createPost = async (req, res) => {
  const post = req.body;
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });
  try {
    await newPost.save();
    res.status(201).json(newPost);
  } catch (error) {
    console.log(error);
  }
};

export const getSinglePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostMessage.findById(postId);
    res.status(200).json(post);
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;

  if (!req.userId) return res.json({ message: "Unauthenticated" });
  const post = await PostMessage.findById(id);
  const index = post.likes.findIndex((id) => id === String(req.userId));
  const existingPlaylist = await playList.findOne({
    name: "Likes",
    userId: req.userId,
  });
  if (index === -1) {
    post.likes.push(req.userId);

    if (existingPlaylist) {
      addToList(req, res, existingPlaylist, id);
    } else {
      createLikeList(req, res, id);
    }
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId));
    if (existingPlaylist) {
      removeFromList(req, res, existingPlaylist, id);
    }
  }

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Post with Id");

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });
  res.json(updatedPost);
};

export const createLikeList = async (req, res, postId) => {
  const likedList = new playList({
    name: "Likes",
    userId: req.userId,
    posts: [postId],
  });

  likedList.save();
};
// for user created playlists, i can probably prompt the user to enter a playlist title and send it here in place of name instead of "Likes" and create new playlists that way

export const fetchLikeList = async (req, res) => {
  const { id } = req.params;
  try {
    const likedPosts = await playList
      .findOne({
        name: "Likes",
        userId: id,
      })
      .populate("posts");

    res.status(200).json(likedPosts);
  } catch (error) {
    console.log(error);
  }
};

export const addToList = async (req, res, playlist, postId) => {
  playlist.posts.push(postId);
  await playlist.save();
};

export const removeFromList = async (req, res, playlist, postId) => {
  if (!playlist.posts.includes(postId)) {
  } else {
    playlist.posts.pull(postId);
    await playlist.save();
  }
};

export const fetchUserPosts = async (req, res) => {
  const { id } = req.params;
  try {
    const userPosts = await PostMessage.find({ creator: id });

    res.status(200).json(userPosts);
  } catch (error) {
    console.log(error);
  }
};
