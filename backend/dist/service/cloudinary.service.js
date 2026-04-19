"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
const apiError_1 = require("../utils/apiError");
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const uploadToCloudinary = async (imagePath) => {
    if (!imagePath)
        throw new apiError_1.CustomError(400, "File not provided");
    try {
        const upload = await cloudinary_1.v2.uploader.upload(imagePath, {
            resource_type: 'image',
            overwrite: true
        });
        if (upload.url && typeof (upload.url) === 'string') {
            fs_1.default.unlink(imagePath, (err) => {
                if (err)
                    console.log("Error deleting file", err);
            });
            return upload.secure_url;
        }
    }
    catch (error) {
        fs_1.default.unlinkSync(imagePath);
        console.log("Error uploading image", error);
        throw new Error("Error uploading file");
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
