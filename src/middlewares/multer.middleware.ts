import multer from "multer";
import { v4 as uudi } from "uuid";

const storage: multer.StorageEngine = multer.diskStorage({
  destination(req, file, callback) {
    console.log(req, file);
    callback(null, "./uploads");
  },
  filename(req, file, callback) {
    console.log(req, file);
    const id = uudi();
    const extName = file.originalname.split(".").pop();
    const fileName = `${id}.${extName}`;
    console.log(fileName);
    callback(null, fileName);
  },
});

export const upload = multer({ storage });
