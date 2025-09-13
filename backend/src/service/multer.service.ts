
import multer from "multer"
import path from 'path'
import { CustomError } from "../utils/apiError";

const storage = multer.diskStorage({
    destination:(req,file,callback)=>{
        callback(null,path.join(__dirname,"../../uploads/avatar"))
    },
    filename:(req, file, callback)=>{
        callback(null, Date.now() + '-' + file.originalname);
    },
})

export const upload = multer({
    storage,
    fileFilter:(req, file, callback)=>{
        if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
           return callback(new CustomError(400,"Invalid file format"))
        }
        callback(null,true)
    },
    limits:{
        files:1,
        fileSize:1024*1024*10
    }
})