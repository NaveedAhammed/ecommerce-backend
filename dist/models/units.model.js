import { Schema, model } from "mongoose";
const sizeSchema = new Schema({
    name: {
        type: String,
        required: [true, "Size name is required"],
        unique: true,
    },
    value: {
        type: String,
        required: [true, "Size value is required"],
        unique: true,
    },
}, { timestamps: true });
const Size = model("Size", sizeSchema);
export default Size;
