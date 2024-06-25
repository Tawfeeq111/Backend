import { User } from "../models/user.model.js"
import uploadOnCoudinary from "../utils/cloudinary.js"
import jwt from "jsonwebtoken"

const generateTokens = async (userId) => {
    try {
        let user = await User.findById(userId)

        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreashToken()


        user.refreashToken = refreshToken

        await user.save({ validateBeforeSave : false })

        return { accessToken, refreshToken }

    } catch (error) {
        res.status(500).json({
            error: "Error in generateTokens"
        })
    }
}

const RegisterUser = async (req, res) => {
    try {
        const { username, email, fullname, password } = req.body;

        if(username === "" || email === "" || fullname === "" || password === ""){
            res.status(400).json({
                error: "Fill all the fields"
            })
        }

        const existUser = await User.findOne({username})

        if(existUser){
            res.status(400).json({
                error: "User already exists"
            })
        }

        const avatarPath = req.files?.avatar[0]?.path
        // const coverImagePath = req.files?.coverImage[0]?.path || ""   // will not work

        let coverImagePath;
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            coverImagePath = req.files.coverImage[0].path
        }

        if(!avatarPath){
            res.status(400).json({
                error: "avatar is required"
            })
        }

        const avatar = await uploadOnCoudinary(avatarPath)
        const coverImage = await uploadOnCoudinary(coverImagePath)

        if(avatar === null){
            res.status(400).json({
                error: "Failed to upload file on cloudinary"
            })
        }

        const user = await User.create({
            fullname,
            username: username.toLowerCase(),
            password,
            email,
            avatar: avatar.url,
            coverImage: coverImage?.url || ""
        })

        const userFromDB = await User.findById(user._id).select("-password -refreashToken")

        if(!userFromDB){
            res.status(500).json({
                error: "Failed to save data in DB"
            })
        }

        res.status(200).send(userFromDB)

    } catch (error) {
        console.log("Error in RegisterUser controller ", error)
        res.status(500).json({
            error: "Error in RegisterUser controller"
        })
    }
}

const LogInUser = async (req, res) => {
    try {

        const { username, email, password } = req.body
        if(!username && !email){
            res.status(400).json({
                error: "username or email is required"
            })
            return;
        }
        if(!password){
            res.status(400).json({
                error: "password is required"
            })
            return;
        }

        const user = await User.findOne({
            $or: [{username}, {email}]
        })

        if(!user){
            res.status(400).json({
                error: "user not found"
            })
            return;
        }
    
        const isPasswordValid = user.isPasswordCorrect(password)

        if(!isPasswordValid){
            res.status(400).json({
                error: "password is incorrect"
            })
            return;
        }

        const {accessToken, refreshToken} = await generateTokens(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        const loggedInUser = await User.findById(user._id).select("-password -refreashToken")

        res.status(200)
        .cookie("AccessToken", accessToken, options)
        .cookie("RefreshToken", refreshToken, options)
        .json({
            user: loggedInUser,
            message: "User sucessfully logged-in"
        })

    } catch (error) {
        console.log("Error in LoginUser controller ", error)
        res.status(500).json({
            error: "Error in LoginUser controller"
        })
    }
}

const LogOutUser = async (req, res) => {
    try {

        let user = await User.findById(req.user._id)
        user.refreashToken = undefined
        await user.save({ validateBeforeSave: false })

        const options = {
            httpOnly: true,
            secure: true
        }

        res.status(200)
        .clearCookie("AccessToken", options)
        .clearCookie("RefreshToken", options)
        .json({
            message: "User sucessfully logged-out"
        })

    } catch (error) {
        console.log("Error in LogOutUser controller ", error)
        res.status(500).json({
            error: "Error in LogOutUser controller"
        })
    }
}

const RefreshAccessToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.RefreshToken || req.header("Authorization")?.replace("Bearer ", "") || ""
        if(!refreshToken){
            res.status(400).json({
                error: "Unauthorized request"
            })
            return;
        }

        const decodedToken = jwt.verify(refreshToken, process.env.REFEREASH_TOKEN_SECREAT)
        const user = await User.findById(decodedToken?._id)
        
        if(!user){
            res.status(400).json({
                error: "Invalid token"
            })
            return;
        }

        if(refreshToken !== user.refreashToken){
            res.status(400).json({
                error: "Refresh Token is expired or used"
            })
            return;
        }

        const options = {
            httpOnly: true,
            secure: true
        }
        const newAccessToken = await user.generateAccessToken()
        const newRefreshToken = await user.generateRefreashToken()
        user.refreashToken = newRefreshToken
        user.save({ validateBeforeSave: false })

        res.status(200)
        .cookie("AccessToken", newAccessToken, options)
        .cookie("RefreshToken", newRefreshToken, options)
        .json({
            message: "Access and Refresh tokens are refreshed"
        })

    } catch (error) {
        console.log("Error in RefreshAccessToken controller ", error)
        res.status(500).json({
            error: "Error in RefreshAccessToken controller"
        })

    }
}



export { RegisterUser, LogInUser, LogOutUser, RefreshAccessToken }