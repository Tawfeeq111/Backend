import { User } from "../models/user.model.js"
import uploadOnCoudinary from "../utils/cloudinary.js";

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
    }
}

export { RegisterUser }