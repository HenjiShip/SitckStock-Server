import mongoose from "mongoose";
import { Schema } from "mongoose";

const playlistSchema = mongoose.Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  // objects need an id before saving so i have to set the default value to a unique id after setting it as Schema.Types.ObjectId
  name: String,
  userId: String,
  posts: [{ type: Schema.Types.ObjectId, ref: "PostMessage" }],
});

const playList = mongoose.model("playList", playlistSchema);

export default playList;
