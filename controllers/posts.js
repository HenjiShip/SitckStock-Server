import PostMessage from "../models/postMessage.js";
import PlayList from "../models/playList.js";
import mongoose from "mongoose";
import userInfo from "../models/userInfo.js";

export const getPosts = async (req, res) => {
  // const { page } = req.query;
  const posts = await PostMessage.find().populate("creatorFiller");
  try {
    res.status(200).json(posts);
  } catch (error) {
    console.log(error);
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  try {
    const uniqueCreatorId = await userInfo.findOne({ userId: req.userId });

    const newPost = new PostMessage({
      ...post,
      userId: req.userId,
      creator: uniqueCreatorId._id,
      creatorFiller: uniqueCreatorId._id,
      createdAt: new Date().toISOString(),
    });
    await newPost.save();

    const responseData = await PostMessage.findById(newPost.id).select(
      "-userId"
    );
    res.status(201).json(responseData);
  } catch (error) {
    console.log(error);
  }
};

export const getSinglePost = async (req, res) => {
  const { postId } = req.params;
  try {
    const post = await PostMessage.findById(postId).populate("creatorFiller");

    res.status(200).json(post);
  } catch (error) {
    console.log(error);
  }
};

export const likePost = async (req, res) => {
  const { id } = req.params;

  if (!req.userId) return res.json({ message: "not authenticated" });

  const post = await PostMessage.findById(id);

  const creatorId = await userInfo.findOne({ userId: req.userId });
  // finding the creator related to the current user

  const isLiked = post.likes.includes(creatorId._id);
  // seeing if creator exists in the likes array

  const existingPlaylist = await PlayList.findOne({
    name: "Likes",
    creator: creatorId._id,
  });

  if (!isLiked) {
    post.likes.push(creatorId._id);

    if (existingPlaylist) {
      addToList(req, res, existingPlaylist, id);
    } else {
      createLikeList(req, res, creatorId._id, id);
    }
  } else {
    post.likes = post.likes.filter(
      (like) => like.toString() !== creatorId._id.toString()
    );
    if (existingPlaylist) {
      removeFromList(req, res, existingPlaylist, id);
    }
  }

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No Post with Id");

  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  }).populate("creatorFiller");

  res.json(updatedPost);
};

export const createLikeList = async (req, res, creator, postId) => {
  const likedList = new PlayList({
    name: "Likes",
    creator: creator,
    creatorFiller: creator,
    posts: [postId],
  });
  await likedList.save();
};
// for user created playlists, i can probably prompt the user to enter a playlist title and send it here in place of name instead of "Likes" and create new playlists that way

export const fetchLikeList = async (req, res) => {
  const { id } = req.params;
  try {
    const likedPosts = await PlayList.findOne({
      name: "Likes",
      creator: id,
    }).populate("posts");

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

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");

  try {
    const post = await PostMessage.find({ _id: id, userId: req.userId });
    if (post) {
      await PostMessage.findByIdAndRemove(id);

      const playlists = await PlayList.find({ posts: id });
      playlists.forEach(async (playlist) => {
        const index = playlist.posts.indexOf(id);
        if (index > -1) {
          playlist.posts.splice(index, 1);
          await playlist.save();
        }
      });
      // this code was used to update playlists on deletion but i switched over to using change streams

      res.json({ message: "deleted" });
    } else {
      res.json({ message: "you're not allowed to delete this" });
    }
  } catch (error) {
    console.log(error);
  }
};
