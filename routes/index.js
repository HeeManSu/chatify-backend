import userRouter from "./user-routes.js";
import chatRouter from "./chatRoutes.js"

function routes(app) {
    app.use("/api/v1", userRouter);
    app.use("/api/v1/chats", chatRouter)
}

export default routes;