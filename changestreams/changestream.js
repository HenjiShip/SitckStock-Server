import mongoose from "mongoose";

export const deletionChanges = () => {
  const Post = mongoose.model("PostMessage");
  const changeStream = Post.watch();

  // Handle change stream events deletion events
  changeStream.on("change", async (change) => {
    if (change.operationType === "delete") {
      const id = change.documentKey._id;
      const PlayList = mongoose.model("playList");
      const playlists = await PlayList.find({ posts: id });
      playlists.forEach(async (playlist) => {
        const index = playlist.posts.indexOf(id);
        //checking for the index of the deleted id in each playlist
        if (index > -1) {
          // if the id is not in playlist.posts hence the -1
          playlist.posts.splice(index, 1);
          //splice(start, deleteCount, item1), if item isn't specified then it just deletes
          await playlist.save();
        }
      });
    }
  });
};
