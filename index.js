// index.js
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/user.js";

// import { deletionChanges } from "./changestreams/changestreams.js";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/posts", postRoutes);
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

    // deletionChanges();
  })
  .catch((error) => console.log(error));

// i generally want to only decode the auth token in the back end, i can create a separate randomly generated ID for each user to send to the front end to search for a users post then use the ID from the decoded token to authorize whether a user can actually delete their post

// soup
// 03/28 soup
