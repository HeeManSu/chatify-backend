import express from "express"
import { config } from "dotenv"
import cookieParser from "cookie-parser"
import errorHandlerMiddleware from "./middlewares/errorHandler.js"
import cors from "cors"
import user from "./routes/userRoutes.js"


config({
    path: "./config/.env"
})

const app = express();

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
)

app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    
    methods: ["GET", "POST", "PUT", "DELETE"],
}))



app.use("/api/v1", user);
export default app;



app.use(errorHandlerMiddleware);

app.get("/", (req, res) => {
    res.send(
        `<h1> Site is working. Click <a herf=}>here </a> to visit frontend.</h1>`
    )
})