import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import dotenv from 'dotenv'

const connectToDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log(`Connected to Data Base`)
    } catch (error){
        console.log(error)
        process.exit(1)
    }
}

export default connectToDB;