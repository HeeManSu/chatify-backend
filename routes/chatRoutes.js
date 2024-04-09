import express from "express"
import { isAuthenticated } from './../middlewares/auth.js';
import { addToGroup, createGroupChat, createPersonChat, fetchAllChats, removefromGroup, renameGroup } from "../controllers/chatController.js";
import singleUpload from "../middlewares/multer.js";

const router = express.Router();

router.route("/personchat").post(isAuthenticated, createPersonChat).get((req, res) => {
    res.send("This is my register page")
});

router.route("/").get(isAuthenticated, fetchAllChats);


// Group Chats
router.route("/groupchat").post(isAuthenticated, singleUpload, createGroupChat);
router.route("/rename").put(isAuthenticated, renameGroup);
router.route("/newadd").put(isAuthenticated, addToGroup);
router.route("/removefromGroup").put(isAuthenticated, removefromGroup);



export default router;