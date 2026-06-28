import express from "express";
import { listUsers, login, me, register, toggleFollow, updateProfile } from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", requireAuth, me);
authRouter.put("/me", requireAuth, updateProfile);
authRouter.get("/users", requireAuth, listUsers);
authRouter.patch("/users/:id/follow", requireAuth, toggleFollow);
