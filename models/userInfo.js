import mongoose from "mongoose";
import { Schema } from "mongoose";

const userInfoSchema = mongoose.Schema({
  name: String,
  email: String,
  userId: { type: String, select: false },
  userImage: String,
  followers: {
    type: [String],
    default: [],
  },
  playlist: [{ type: Schema.Types.ObjectId, ref: "playList" }],
});

const userInfo = mongoose.model("userInfo", userInfoSchema);

export default userInfo;

// i want to dispatch this when i go to a users page, i want to get the user name and image. before i grab the information though, i should check if the user already exists and create a new schema if it does.
// to edit this data, i should findOne() with a matching userId
