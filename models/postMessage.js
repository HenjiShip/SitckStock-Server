import mongoose from "mongoose";

// schema defines the structure of the data that im sending to the back end. When i GET from the front end, it will use .find() to search for this structure in the back end but it also uses this structure to POST to the backend
const postSchema = mongoose.Schema({
  title: String,
  message: String,
  name: String,
  creator: String,
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
});

const PostMessage = mongoose.model("PostMessage", postSchema);

export default PostMessage;
