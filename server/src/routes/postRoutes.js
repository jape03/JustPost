import express from "express";
import {
  addComment,
  createPost,
  deletePost,
  listPosts,
  toggleRepost,
  toggleLike,
  updatePost
} from "../controllers/postController.js";
import { requireAuth } from "../middleware/auth.js";

export const postRouter = express.Router();

postRouter.get("/", listPosts);
postRouter.post("/", requireAuth, createPost);
postRouter.put("/:id", requireAuth, updatePost);
postRouter.patch("/:id/like", requireAuth, toggleLike);
postRouter.patch("/:id/repost", requireAuth, toggleRepost);
postRouter.post("/:id/comments", requireAuth, addComment);
postRouter.delete("/:id", requireAuth, deletePost);
