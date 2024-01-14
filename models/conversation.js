import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema({
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    groupChatName: {
        type: String,
    },
    groupChatImage: {
        type: String,
    },
    latestMessage: {
        type: Object,
    },
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    }]
}, {
    timestamps: true,
})

export default mongoose.model("Conversation", conversationSchema);