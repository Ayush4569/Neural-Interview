import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
  });

 export const uploadToCloudinary = async(imagePath:string)=>{
    try {
        const upload = await cloudinary.uploader.upload(imagePath,{
            resource_type:'image',
            overwrite:true
        })
        console.log('upload res',upload);
        if(upload.url && typeof(upload.url)=== 'string') {
            return upload.secure_url as string
        }
    } catch (error) {
        console.log("Error uploading image",error);
        throw new Error("Error uploading file")
    }
 } 