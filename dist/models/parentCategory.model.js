import { Schema, model } from "mongoose";
const parentCategorySchema = new Schema({
    name: {
        type: String,
        required: [true, "Parent category name is required"],
        unique: true,
    },
}, { timestamps: true });
const ParentCategory = model("ParentCategory", parentCategorySchema);
export default ParentCategory;
