import { catchAsyncError } from "../middlewares/catchAsyncError.js"
import ApiError from "../utils/ApiError.js"
import userModel from "../models/userModel.js"
import { sendToken } from "../utils/sendToken.js";
import cloudinary from "cloudinary"
import getDataUri from "../utils/dataUri.js";
// import { sendEmail } from "../utils/nodeEmail.js";
// import crypto from "crypto"

export const register = catchAsyncError(async (req, res, next) => {
    const { name, email, password, username } = req.body;
    const file = req.file;

    if (!name || !email || !password || !file || !username) {
        return next(new ApiError("Please enter all field", 400))
    }

    let user = await userModel.findOne({ $or: [{ email }, { username }] });

    if (user) {
        if (user.email === email) {
            return next(new ApiError("User with this email already exists", 401))
        } if (user.username === username) {
            return next(new ApiError("User with this username already exists", 401))

        }
    }

    //upload file on cloudinary
    const fileUri = getDataUri(file);
    const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

    //To add new user in the database.
    user = await userModel.create({
        name,
        email,
        password,
        username,
        avatar: {
            public_id: mycloud.public_id,
            url: mycloud.secure_url,
        },

    })
    //Without the jwt token . The user will not be able to use some of the protecte routes or do some particular actions.
    sendToken(res, user, "Registered Successfully", 201);
})



export const login = catchAsyncError(async (req, res, next) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return next(new ApiError("Please enter all field", 400))
    }
    let user = await userModel.findOne({ username }).select("+password");

    if (!user) {
        return next(new ApiError("Incorrect username or password", 401));
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
        return next(new ApiError("Incorrect email or password", 401))
    }


    sendToken(res, user, `Welcome back, ${user.name}`, 200);
})

export const logout = catchAsyncError(async (req, res, next) => {
    res.status(200).cookie("token", null, {
        //Cookie to null and deltes the cookie in the browser now.
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: true,
        sameSite: "none",
    }).json({
        success: true,
        message: "Logged out successfully",
    })
})

export const searchUser = catchAsyncError(async (req, res, next) => {
    const { search } = req.query;
    let filter = {};

    // If search query is provided, construct the keyword filter
    if (search) {
        filter.username = { $regex: search, $options: "i" };
    }

    // Exclude the current user from search results
    filter._id = { $ne: req.user._id };

    // Find users based on the constructed filter
    const users = await userModel.find(filter);

    res.status(200).json({
        success: true,
        users,
    });
});


export const getMyProfile = catchAsyncError(async (req, res) => {
    const user = await userModel.findById(req.user._id);
    res.status(200).json({
        success: true,
        user,
    })
})

// export const searchUsers = catchAsyncError(async (req, res, next) => {
//     const search = req.query.search;
//     const page = Number(req.query.page) || 1;
//     const limit = Number(req.query.limit) || 10;
//     const skip = (page - 1) * limit;

//     const loggedInUserId = req.user?._id;
//     const keyword = search ? {
//         $or: [
//             { username: { $regex: search, $options: "i" } },
//             { email: { $regex: search, $options: "i" } },
//         ]
//     } : {};

//     const whereQuery = {
//         $and: [
//             keyword,
//             loggedInUserId ? { _id: { $ne: loggedInUserId } } : {}
//             // { _id: { $ne: req.user._id } }
//         ],
//     };

//     const users = await userModel.find(whereQuery).skip(skip).limit(limit);
//     const totalUsers = await userModel.countDocuments(whereQuery);
//     res.status(200).json({
//         success: true,
//         users,
//         meta: {
//             page,
//             limit,
//             search,
//             total: totalUsers,
//         }
//     })
// })

// export const forgetpassword = catchAsyncError(async (req, res, next) => {

//     const { email } = req.body;

//     const user = await userModel.findOne({ email });
//     if (!user) {
//         return next(new errorHandlerClass("No user with give email found", 400));
//     }

//     const resetToken = await user.getResetToken();
//     await user.save();
//     // http://localhost:3000/resetpassword/dhfajfhdjhdkalhfjdh
//     const url = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`;

//     const message = `Click on the link to reset your password. ${url}. if you have not requested then please ignore.`
//     //send token via email
//     await sendEmail(user.email, "Whisper Reset password", message)
//     res.status(200).json({
//         success: true,
//         message: `reset token has been sent to ${user.email}`,
//     })

// })


// export const resetpassword = catchAsyncError(async (req, res, next) => {
//     const { token } = req.params;

//     const resetPasswordToken = crypto.createHash("sha256")
//         .update(token)
//         .digest("hex");

//     const user = await userModel.findOne({
//         resetPasswordToken,
//         resetPasswordExpire: {
//             $gt: Date.now(),
//         },

//     })
//     if (!user) {
//         return next(new errorHandlerClass("Token is invalid or has been expired"));
//     }

//     user.password = req.body.password;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpire = undefined;

//     user.save();

//     res.status(200).json({
//         success: true,
//         message: "password changed successfully",
//         token
//     })
// })


// export const getMyProfile = catchAsyncError(async (req, res, next) => {
//     const user = await userModel.findById(req.user._id);
//     res.status(200).json({
//         success: true,
//         user,
//     })
// })


// // /api/v1/searchuser?search=
// export const searchUser = catchAsyncError(async (req, res, next) => {
//     const { search } = req.query;
//     const keyword = search ? {
//         $or: [
//             { username: { $regex: search, $options: "i" } },
//             { email: { $regex: search, $options: "i" } },
//         ]
//     } : {};

//     const users = await userModel.find({
//         $and: [
//             keyword,
//             { _id: { $ne: req.user._id } }
//         ]
//     });

//     res.status(200).json({
//         success: true,
//         users,

//     })
// })


// export const updateprofilepicture = catchAsyncError(async (req, res, next) => {

//     const file = req.file;
//     const user = await userModel.findById(req.user._id);
//     const fileUri = getDataUri(file);
//     const mycloud = await cloudinary.v2.uploader.upload(fileUri.content)

//     await cloudinary.v2.uploader.destroy(user.avatar.public_id)

//     user.avatar = {
//         public_id: mycloud.public_id,
//         url: mycloud.secure_url,
//     }

//     await user.save();

//     res.status(200).json({
//         success: true,
//         message: "profile picture updated successfully",
//     })
// })


// export const changepassword = catchAsyncError(async (req, res, next) => {

//     const { oldPassword, newPassword } = req.body;

//     if (!oldPassword || !newPassword) {
//         return next(new errorHandlerClass("Please enter all fields", 400))
//     }
//     const user = await userModel.findById(req.user._id).select('+password');

//     const isMatch = await user.comparePassword(oldPassword);

//     if (!isMatch) {
//         return next(new errorHandlerClass("Incorrect old password", 400));
//     }
//     user.password = newPassword;
//     await user.save();
//     res.status(200).json({
//         success: true,
//         message: "Password changed successfully",
//     })
// })

// export const updateProfile = catchAsyncError(async (req, res, next) => {

//     const { email } = req.body;
//     const user = await userModel.findById(req.user._id);

//     if (email) {
//         user.email = email;
//     }

//     await user.save();
//     res.status(200).json({
//         success: true,
//         message: "Email updated successfully",
//     })
// })

