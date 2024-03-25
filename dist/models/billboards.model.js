import { Schema, Types, model } from "mongoose";
const categorySchema = new Schema({
    title: {
        unique: true,
        type: String,
        required: [true, "Billboard title is required"],
    },
    category: {
        type: Types.ObjectId,
        required: true,
        ref: "ParentCategory",
    },
    imageUrl: {
        type: String,
        required: [true, "Billboard image is required"],
    },
    isActive: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Billboard = model("Billboard", categorySchema);
export default Billboard;
