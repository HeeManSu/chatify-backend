
import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { allMessages, sendMessage } from "../controllers/messageController.js";
const router = express.Router()

router.route('/message').post(isAuthenticated, sendMessage);
router.route('/message/:chatId').get(isAuthenticated, allMessages);

export default router;