import { Router } from "express";
import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import Conversation from "../models/conversation.js";
import { isAuthenticated } from "../middlewares/auth.js";

const router = Router();

router.get("/", isAuthenticated, catchAsyncError(async (req, res) => {
    const conversations = await Conversation.find({ participants: req.user._id })
        .populate("members", "name avatar username _id")
        .populate("lastMessage")
        .sort("-updatedAt")
    res.json({
        success: true,
        conversations,
    });

}));

export default router