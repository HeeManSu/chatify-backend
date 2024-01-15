import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import chatModel from "../models/chatModel.js"
import userModel from "../models/userModel.js"
import getDataUri from "../utils/dataUri.js";
import errorHandlerClass from "../utils/ApiError.js";
import cloudinary from "cloudinary"


export const createPersonChat = catchAsyncError(async (req, res, next) => {
    try {
        const targetId = req.body.targetId

        let isChat = await chatModel.findOne({
            isGroupChat: false,
            users: {
                $size: 2,
                $all: [targetId, req.body.userId],
            }
        }).populate({
            path: "users",
            select: "-passsword",
        }).populate({
            path: "latestMessage",
            populate: {
                path: "sender",
                select: "name avatar email username"
            },
        });

        if (!isChat) {
            const chatData = {
                chatName: "Sender",
                isGroupChat: false,
                users: [req.user._id, targetId],
            };

            const createChat = await chatModel.create(chatData);
            isChat = await chatModel.findOne({
                _id: createChat._id
            }).populate({
                path: "users",
                select: "-password",
            });

            res.status(200).json({
                success: true,
                message: "New Chat Created Successfully",
                chat: isChat,
            });
        } else {
            res.status(200).json({
                success: true,
                message: 'Chat found',
                chat: isChat,
            });
        }
    } catch (error) {
        // next(new errorHandlerClass("Unable to create chat", 400));
        throw new Error(error);
    }
})



export const fetchAllChats = catchAsyncError(async (req, res, next) => {
    try {
        const userId = req.user._id;

        const chats = await chatModel.find({ users: { $elemMatch: { $eq: userId } } })
            .populate({
                path: "users",
                select: "-password",
            })
            .populate({
                path: "groupAdmin",
                select: "-password",
            })
            .populate({
                path: "latestMessage",
                populate: {
                    path: "sender",
                    select: "name avatar email username",
                },
            })
            .sort({ updatedAt: -1 });

        const populatedChats = await userModel.populate(chats, {
            path: "latestMessage.sender",
            select: "name avatar email username",
        });

        res.status(200).json({
            success: true,
            message: "Chats retrieved successfully",
            chats: populatedChats,
        });


    } catch (error) {
        throw new Error(error);
    }
})




export const createGroupChat = catchAsyncError(async (req, res, next) => {
    try {
        const { name, users } = req.body;
        const file = req.file;

        if (!name || !users || !file) {
            return next(new errorHandlerClass("Please Enter all Fields", 400));
        }

        const parsedUsers = users

        if (parsedUsers.length < 2) {
            return next(new errorHandlerClass("Add more than 2 users", 400));
        }

        parsedUsers.push(req.user);

        const fileUri = getDataUri(file);
        const myCloud = await cloudinary.uploader.upload(fileUri.content);

        const groupChat = await chatModel.create({
            chatName: name,
            users: parsedUsers,
            isGroupChat: true,
            groupAdmin: req.user,
            avatar: {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            }
        });

        const fullGroupChat = await chatModel
            .findOne({ _id: groupChat._id })
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        res.status(200).json({
            success: true,
            message: "Group chat created",
            newChat: fullGroupChat
        });
    } catch (error) {
        throw new Error(error);
    }
});


export const renameGroup = catchAsyncError(async (req, res, next) => {
    try {
        const { newChatName, chatId } = req.body;

        const updatedChatName = await chatModel.findByIdAndUpdate(
            chatId,
            { chatName: newChatName },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!updatedChatName) {
            return next(new errorHandlerClass("Chat not found", 400));
        }

        res.status(200).json({
            success: true,
            message: "Group name updated",
            updatedChatName,
        });

    } catch (error) {
        next(new errorHandlerClass("Failed to rename group", 400));
    }
});



export const addToGroup = catchAsyncError(async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return next(new errorHandlerClass("Chat does not exist", 400));
        }

        const existingUserIndex = chat.users.findIndex(user => user.toString() === userId);
        if (existingUserIndex !== -1) {
            return next(new errorHandlerClass("User already exists in the group", 200));
        }

        const added = await chatModel.findOneAndUpdate(
            { _id: chatId },
            { $push: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!added) {
            return next(new errorHandlerClass("Chat does not exist ", 400));
        }
        res.status(200).json({
            success: true,
            message: "user added in the group.",
            added,
        });


    } catch (error) {
        next(new errorHandlerClass("Failed to add new person to group chat", 400));
    }
})


export const removefromGroup = catchAsyncError(async (req, res, next) => {
    try {
        const { chatId, userId } = req.body;

        const chat = await chatModel.findById(chatId);
        if (!chat) {
            return next(new errorHandlerClass("Chat does not exist", 400));
        }

        const existingUserIndex = chat.users.findIndex(user => user.toString() === userId);
        if (!existingUserIndex) {
            return next(new errorHandlerClass("User is not present in the group", 200));
        }

        const removed = await chatModel.findOneAndUpdate(
            { _id: chatId },
            { $pull: { users: userId } },
            { new: true }
        )
            .populate("users", "-password")
            .populate("groupAdmin", "-password");

        if (!removed) {
            return next(new errorHandlerClass("Chat does not exist ", 400));
        }
        res.status(200).json({
            success: true,
            message: "user removed from the group.",
            removed,
        });


    } catch (error) {
        next(new errorHandlerClass("Failed to remove person to group chat", 400));
    }
})