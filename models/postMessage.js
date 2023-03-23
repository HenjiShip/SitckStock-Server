import mongoose from "mongoose";
const { Schema } = mongoose;

const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  userId: { type: String, select: false },
  tags: [String],
  selectedFile: String,
  likes: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: new Date(),
  },
  creator: { type: Schema.Types.ObjectId },
  creatorFiller: { type: Schema.Types.ObjectId, ref: "userInfo"},
});

const PostMessage = mongoose.model("PostMessage", postSchema);

export default PostMessage;
