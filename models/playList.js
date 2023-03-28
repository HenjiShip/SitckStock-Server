import mongoose from "mongoose";
import { Schema } from "mongoose";

const playlistSchema = mongoose.Schema({
  name: String,
  userId: { type: String, select: false },
  posts: [{ type: Schema.Types.ObjectId, ref: "PostMessage" }],

  creator: { type: Schema.Types.ObjectId },
  creatorFiller: { type: Schema.Types.ObjectId, ref: "userInfo" },
});

const playList = mongoose.model("playList", playlistSchema);

export default playList;

// objects need an id before saving so i have to set the default value to a unique id after setting it as Schema.Types.ObjectId
