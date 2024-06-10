import {v2 as cloudinary} from 'cloudinary'
import fs from 'fs'

//configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});


//uploading on cloudinary
const uploadOnCoudinary = async (localPath) => {
    try{

        if(!localPath) return null

        const uploadResult = await cloudinary.uploader.upload(localPath, { resource_type: "auto" })
        fs.unlinkSync(localPath)
        
        return uploadResult
    } 
    catch(error){
        console.log("error in uploading file in couldinary", error)
        fs.unlinkSync(localPath)
        return null
    }
}

export default uploadOnCoudinary