import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js"

const verifyJWT = async (req, res, next) => {
    try {
        // check { accessToken }
        const accessToken = req.cookies?.AccessToken // || req.header("Authorization")?.replace("Bearer ", "")
        if(!accessToken){
            res.status(400).json({
                error: "Unauthorized request"
            })
        }
        const token = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECREAT)
        const user = await User.findById(token._id).select("-password -refreashToken")
        if(!user){
            res.status(400).json({
                error: "Invalid Access-Token"
            })
        }
        req.user = user
        next()

    } catch (error) {
        res.status(500).json({
            error: "Error in verifyJWT middleware"
        })
    }
}

export default verifyJWT