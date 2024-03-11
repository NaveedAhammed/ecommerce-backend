import multer from "multer";
import { v4 as uudi } from "uuid";
const storage = multer.diskStorage({
    destination(req, file, callback) {
        callback(null, "./uploads");
    },
    filename(req, file, callback) {
        const id = uudi();
        const extName = file.originalname.split(".").pop();
        const fileName = `${id}.${extName}`;
        callback(null, fileName);
    },
});
export const upload = multer({ storage });
