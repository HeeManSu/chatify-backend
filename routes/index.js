import userRouter from "./userRoutes.js";
import chatRouter from "./chatRoutes.js";
import messageRoutes from "./messageRoutes.js";


function routes(app) {
    app.use("/api/v1", userRouter);
    app.use("/api/v1", chatRouter);
    app.use("/api/v1", messageRoutes);
}

export default routes;