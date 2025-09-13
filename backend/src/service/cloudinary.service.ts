import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'
import { CustomError } from '../utils/apiError';
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
  });

 export const uploadToCloudinary = async(imagePath:string)=>{
    if(!imagePath) throw new CustomError(400,"File not provided")
    try {
        const upload = await cloudinary.uploader.upload(imagePath,{
            resource_type:'image',
            overwrite:true
        })
        console.log('upload res',upload);
        if(upload.url && typeof(upload.url)=== 'string') {
            fs.unlink(imagePath,(err)=> {
                if(err) console.log("Error deleting file",err);
                console.log('File deleted');
            });
            return upload.secure_url as string
        }
    } catch (error) {
        fs.unlinkSync(imagePath)
        console.log("Error uploading image",error);
        throw new Error("Error uploading file")
    }
 } 