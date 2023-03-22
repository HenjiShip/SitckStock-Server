import express from "express";
import { createUser, fetchUser } from "../controllers/user.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/createUser", createUser);
router.get("/user/:userId", fetchUser);

export default router;
