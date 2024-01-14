import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    chatName: {
        type: String,
        required: [true, "Please enter chat name"],
        trim: true,
    },
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    isGroupChat: {
        type: Boolean,
        default: false,
    },
    latestMessage: {  // Corrected field name
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    groupAdmin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    avatar: {
        public_id: {
            type: String,
            required: false,
        },
        url: {
            type: String,
            required: false,
        }
    },
},
    {
        timestamps: true,
    }
)
export default mongoose.model('Chat', chatSchema);
