import { Schema, model } from "mongoose";
const colorSchema = new Schema({
    name: {
        unique: true,
        type: String,
        required: [true, "Color name is required"],
    },
    value: {
        unique: true,
        type: String,
        required: [true, "Color value is required"],
    },
}, { timestamps: true });
const Color = model("Color", colorSchema);
export default Color;
