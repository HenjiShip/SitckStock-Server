import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import postRoutes from "./routes/posts.js";
import userRoutes from "./routes/user.js";

const app = express();
dotenv.config();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

// app.use makes it so that "/posts" is used as the base url for all the methods in postRoutes, which is why we're getting from "localhost:5000/ports" in the client
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

// const CONNECTION_URL =
//   "mongodb+srv://henrydazn:henrydazn123@cluster0.5pnxmj7.mongodb.net/?retryWrites=true&w=majority";

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  )
  .catch((error) => console.log(error.message));

// https://stackoverflow.com/questions/74136383/user-is-not-allowed-to-do-action-find-on-test-postmessages/74139878#74139878?newreg=803e5a10db8649828e32d6ebd5fa221d
// ran into an error at the start where my key user on atlas mongoDB didn't have all access
