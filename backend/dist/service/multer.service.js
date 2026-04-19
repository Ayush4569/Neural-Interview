"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const apiError_1 = require("../utils/apiError");
const storage = multer_1.default.diskStorage({
    destination: (req, file, callback) => {
        callback(null, path_1.default.join(__dirname, "../../uploads/avatar"));
    },
    filename: (req, file, callback) => {
        callback(null, Date.now() + '-' + file.originalname);
    },
});
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
            return callback(new apiError_1.CustomError(400, "Invalid file format"));
        }
        callback(null, true);
    },
    limits: {
        files: 1,
        fileSize: 1024 * 1024 * 10
    }
});
