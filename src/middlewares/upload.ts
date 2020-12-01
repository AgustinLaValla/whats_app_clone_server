import { Request } from 'express';
import * as  multer from 'multer';
import * as path from 'path';
import { v4 as uuid } from 'uuid';

const imageFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    if (file.mimetype.startsWith("image")) {
        cb(null, true)
    } else {
        cb("Only images are allowed", false);
    }
}

let storage = multer.diskStorage({
    destination: path.join(__dirname, '..', '..', 'uploads'),
    filename: (req, file, cb) => {
        cb(null,  uuid() + path.extname(file.originalname).toLowerCase());
    }
})

export default multer({
    dest: path.join(__dirname, '..', '..', 'uploads'),
    storage,
    fileFilter: imageFilter,
    // limits: { fileSize: }
});