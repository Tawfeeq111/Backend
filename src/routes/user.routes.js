import { Router } from "express"
import { LogInUser, LogOutUser, RegisterUser } from "../controllers/user.controllers.js"
import { upload } from "../middlewares/multer.middleware.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1
    }
]) ,RegisterUser)

router.route("/login").post(LogInUser)

router.route("/logout").post(verifyJWT, LogOutUser)

export default router