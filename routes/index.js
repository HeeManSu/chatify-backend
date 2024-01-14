import userRouter from "./user-routes.js";
import conversationRouter from "./conversation-routes.js"


function routes(app) {
    app.use("/api/v1", userRouter);
    app.use("/api/v1/conversations", conversationRouter);
}

export default routes;