import { User } from "../models/user.model.js"
import uploadOnCoudinary from "../utils/cloudinary.js";

const RegisterUser = async (req, res) => {
    try {
        const { username, email, fullname, password } = req.body;
        console.log(username, email, fullname, password);

        if(username === "" || email === "" || fullname === "" || password === ""){
            res.status(400).json({
                error: "Fill all the fields"
            })
        }

        const existUser = await User.findOne({username})
        console.log(existUser)

        if(existUser){
            res.status(400).json({
                error: "User already exists"
            })
        }

        const avatarPath = req.files?.avatar[0]?.path
        const coverImagePath = req.files?.coverImage[0]?.path

        if(!avatarPath){
            res.status(400).json({
                error: "avatar is required"
            })
        }

        const avatar = uploadOnCoudinary(avatarPath);
        const coverImage = "";
        if(coverImagePath){
            coverImage = uploadOnCoudinary(coverImage)
        }

        if(!avatar){
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
            coverImage: coverImage.url
        })

        const userFromDB = User.findById(user._id).select("-password -refreashToken")

        if(!userFromDB){
            res.status(500).json({
                error: "Failed to save data in DB"
            })
        }

        res.status(200).json(userFromDB)

    } catch (error) {
        console.log("Error in RegisterUser controller ", error)
    }
}

export { RegisterUser }