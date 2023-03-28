import express from "express";
import mongoose from "mongoose";

import PostMessage from "../models/postMessage.js";

const router = express.Router();

export const getSinglePost = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await PostMessage.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPostsBySearch = async (req, res) => {
  const { searchQuery, tags } = req.query;
  try {
    const title = new RegExp(searchQuery, "i");

    const posts = await PostMessage.find({
      $or: [{ title }, { tags: { $in: tags.split(",") } }],
    });

    res.json({ data: posts });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// find() finds any collection within "/posts" in the database that matches the PostMessage schema
export const getPosts = async (req, res) => {
  const { page } = req.query;
  try {
    const LIMIT = 8;
    const startIndex = (Number(page) - 1) * LIMIT; //get the starting index of each page
    const total = await PostMessage.countDocuments({});
    const posts = await PostMessage.find()
      .sort({ _id: -1 })
      .limit(LIMIT)
      .skip(startIndex);

    // then its sent back to the front end as a json
    res.status(200).json({
      data: posts,
      currentPage: Number(page),
      numberOfPages: Math.ceil(total / LIMIT),
    });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

//  this code creates a new schema and saves it to my database inside of the "/posts" route since it was specified with app.use("/posts", postRoutes) in the main index.js
// req = "/" and res = this function
export const createPost = async (req, res) => {
  const post = req.body;

  // creates a new schema using the req.body sent from the front end(), originates from postData
  const newPost = new PostMessage({
    ...post,
    creator: req.userId,
    createdAt: new Date().toISOString(),
  });

  try {
    // then saves it to the back end
    await newPost.save();

    // once its saved to the back end, i send the newPost aka. postData back to the front end to save it locally to the posts state so i dont have to call the get post method again
    res.status(201).json(newPost);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  // grabs the /posts/:id
  const post = req.body;
  // req.post is grabbing all the info available in /posts/:id which should be postData

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");

  // uses the updated postData from the front end as post and updates the post with the matching id
  const updatedPost = await PostMessage.findByIdAndUpdate(id, post, {
    new: true,
  });

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");

  await PostMessage.findByIdAndRemove(id);

  res.json({ message: "Post Deleted" });
};

export const likePost = async (req, res) => {
  const { id } = req.params;
  // auth middleware handles this step verifying the token
  if (!req.userId) return res.json({ message: "Unauthenticated" });

  const post = await PostMessage.findById(id);

  const index = post.likes.findIndex((id) => id === String(req.userId));

  if (index === -1) {
    post.likes.push(req.userId);
  } else {
    post.likes = post.likes.filter((id) => id !== String(req.userId));
  }

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("No post with that ID");

  const updatedPost = await PostMessage.findByIdAndUpdate(
    id,
    post,
    // {
    //   likeCount: post.likeCount + 1,
    //   // updating the like count by adding 1 to the old likecount
    // },
    { new: true }
  );
  res.json(updatedPost);
};
