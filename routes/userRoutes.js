import express from "express"
// import { changepassword, forgetpassword, getMyProfile, login, logout, register, resetpassword, searchUser, updateProfile, updateprofilepicture } from "../controllers/userController.js";
import singleUpload from '../middlewares/multer.js';
import { isAuthenticated } from "../middlewares/auth.js";
import { getMyProfile, login, logout, register, searchUser} from "../controllers/userController.js";

const userRouter = express.Router();

//To register a user
userRouter.route("/register").post(singleUpload, register).get((req, res) => {
    res.send("This is my register page")
})

//To login a user
userRouter.route("/login").post(login).get((req, res) => {
    res.send("This request is for login")
})

// To search user for creating chat
userRouter.route("/searchuser").get(isAuthenticated, searchUser).get((req, res) => {
    res.send("This is my register page")
})

//Get my profile
userRouter.route("/me").get(isAuthenticated, getMyProfile)

//logout
userRouter.route("/logout").get(logout)

// //forget password
// router.route("/forgetpassword").post(forgetpassword)

// //reset password
// router.route("/resetpassword/:token").put(resetpassword)

// //Get my profile
// router.route("/me").get(isAuthenticated, getMyProfile)

// //Search User
// router.route("/searchuser").get(isAuthenticated, searchUser)

// //update profile picture
// router.put("/updateprofilepicture", isAuthenticated, singleUpload, updateprofilepicture);

// router.route("/changepassword").put(isAuthenticated, changepassword).get((req, res) => {
//     res.send("This routes is for changing password")
// })

// //UpdatePassword
// router.route("/updateprofile").put(isAuthenticated, updateProfile).get((req, res) => {
//     res.send("This routes is for updating profile")
// })


export default userRouter;