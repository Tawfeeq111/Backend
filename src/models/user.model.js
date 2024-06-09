import mongoose from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullname: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String,
        required: true
    },
    coverImage: {
        type: String
    },
    watchHistory: [
        {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, "Password is required"]
    },
    refreashToken: {
        type: String
    }
}, { timestamps: true })

userSchema.pre("save", async function(next){
    if(!this.isModified("passwoard")) return next();
    this.password = bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function() {
    jwt.sign(
        {
            _id: this._id,
            username: this.username,
            email: this.email,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECREAT,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRAY
        }
    )
}

userSchema.methods.generateRefreashToken = function(){
    jwt.sign(
        {
            _id: this._id
        },
        process.env.REFEREASH_TOKEN_SECREAT,
        {
            expiresIn: process.env.REFEREASH_TOKEN_EXPIARY
        }
    )
}

export const User = mongoose.model("User", userSchema)