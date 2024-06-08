import mongoose, { Mongoose } from "mongoose";
import { DB_NAME } from "./constants.js";
import app from './app.js'
import connectToDB from "./db/connect.js";
import dotenv from "dotenv";

// dotenv.config({
//     path: './env'
// })

const connectDB = async () => {
    try {
        // console.log(process.env.MONGODB_URI + '/' + DB_NAME) will not connect
        // console.log(`${process.env.MONGODB_URI}/${DB_NAME}`)
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.listen(process.env.PORT, () => {
            console.log(`Listening on port ${process.env.PORT}`)
        })

    } catch (error) {
        console.log(error)
        process.exit(1)
    }
}

connectDB()

// connectToDB();