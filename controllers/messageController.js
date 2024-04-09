import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import chatModel from "../models/chatModel.js";
import messageModel from "../models/messageModel.js";
import userModel from "../models/userModel.js";
import ApiError from "../utils/ApiError.js";

export const sendMessage = catchAsyncError(async (req, res, next) => {
    try {
        const { chatId, content } = req.body;

        if (!content || !chatId) {
            return next(ApiError("Invalid data", 400));
        }

        var newMessage = {
            sender: req.user._id,
            content: content,
            chat: chatId
        }

        var message = await messageModel.create(newMessage);
        message = await message.populate("sender", "name avatar")
        message = await message.populate("chat")
        message = await userModel.populate(message, {
            path: 'chat.users',
            select: "name avatar email",
        });

        await chatModel.findByIdAndUpdate(req.body.chatId, {
            latestMessage: message,
        })

        res.status(200).json({
            success: true,
            message: "Message sent successfully",
            chatMessage: message,
        });

    } catch (error) {
        next(new ApiError("Failed to send messages", 400));
    }
})

export const allMessages = catchAsyncError(async (req, res, next) => {

    try {
        const messages = await messageModel.find({ chat: req.params.chatId }).populate(
            "sender",
            "name avatar email"
        ).populate("chat");

        res.status(200).json({
            success: true,
            message: "All messages fetched",
            allMessages: messages,
        });
    } catch (error) {
        next(new ApiError("Failed to fetch all the messages", 400))
    }

})