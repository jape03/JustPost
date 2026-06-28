import express from "express";
import {
  listConversations,
  listConversation,
  listUnreadCounts,
  sendMessage
} from "../controllers/messageController.js";
import { requireAuth } from "../middleware/auth.js";

export const messageRouter = express.Router();

messageRouter.get("/unread/counts", requireAuth, listUnreadCounts);
messageRouter.get("/conversations", requireAuth, listConversations);
messageRouter.get("/:userId", requireAuth, listConversation);
messageRouter.post("/:userId", requireAuth, sendMessage);
