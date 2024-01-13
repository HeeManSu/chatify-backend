
import app from "./app.js";
import http from "http"
import { connectDB } from "./config/database.js";
import { v2 as cloudinary } from "cloudinary";

connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_API,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
})

const server = http.createServer(app);

server.listen(process.env.PORT, () => {
    console.log(`Server is working on port: ${process.env.PORT}`)
})