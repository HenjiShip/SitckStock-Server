import express from "express";
import { createUser, fetchUser, fetchUserId } from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/createUser", createUser);
router.get("/user/:creator", fetchUser);
router.get("/fetchuserid", auth, fetchUserId);

export default router;
