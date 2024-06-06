import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "./constants.js";
import express from "express";
import connectToDB from "./db/connect.js";
import dotenv from "dotenv";

// dotenv.config({
//     path: './env'
// })

const app = express()

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

// connectDB()

connectToDB();