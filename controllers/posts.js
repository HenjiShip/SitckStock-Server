import PostMessage from "../models/postMessage.js";
import PlayList from "../models/playList.js";
import mongoose from "mongoose";
import userInfo from "../models/userInfo.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Upload

// const res = cloudinary.uploader.upload(
//   "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }
// );

// res
//   .then((data) => {
//     console.log(data);
//     console.log(data.secure_url);
//   })
//   .catch((err) => {
//     console.log(err);
//   });

export const getPosts = async (req, res) => {
  const { page } = req.query;
  const LIMIT = 8;
  const startIndex = (Number(page) - 1) * LIMIT;
  const total = await PostMessage.countDocuments({});

  const posts = await PostMessage.find()
    .sort({ _id: -1 })
    .limit(LIMIT)
    .skip(startIndex)
    .populate("creatorFiller");

  try {
    res.status(200).json({
      data: posts,
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    console.log(error);
  }
};

export const createPost = async (req, res) => {
  const post = req.body;

  try {
    let cloudinaryRes = await cloudinary.uploader.upload(post.selectedFile);

    const uniqueCreatorId = await userInfo.findOne({ userId: req.userId });

    const newPost = new PostMessage({
      ...post,
      selectedFile: cloudinaryRes.secure_url,
      userId: req.userId,
      creator: uniqueCreatorId._id,
      creatorFiller: uniqueCreatorId._id,
      createdAt: new Date().toISOString(),
    });
    await newPost.save();

    await cloudinary.uploader.rename(
      cloudinaryRes.public_id,
      newPost._id.toString()
    );
    cloudinaryRes = await cloudinary.api.resource(newPost._id.toString());

    newPost.selectedFile = await cloudinaryRes.secure_url;

    newPost.save();

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
  // in the future, rather than sending a response back, i should just update whether it's liked or not visually on the front end only so its more snappy with the likes update. So basically update it on both the front end state as well as the backend.

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
    const post = await PostMessage.findOne({ _id: id, userId: req.userId });
    if (post) {
      await cloudinary.uploader.destroy(post._id);
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

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const post = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that id");

  try {
    await PostMessage.findOneAndUpdate({ _id: id, userId: req.userId }, post, {
      new: true,
    });
  } catch (error) {
    console.log(error);
  }
};

// this project will use "https://cloudinary.com/documentation/node_integration" to make querying posts much faster
