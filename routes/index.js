import userRouter from "./userRoutes.js";
import chatRouter from "./chatRoutes.js"

function routes(app) {
    app.use("/api/v1", userRouter);
    app.use("/api/v1", chatRouter)
}

export default routes;