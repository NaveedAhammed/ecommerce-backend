import { Schema, Types, model } from "mongoose";
const childCategorySchema = new Schema({
    parentCategory: {
        type: Types.ObjectId,
        required: [true, "Parent category is required"],
        ref: "ParentCategory",
    },
    name: {
        type: String,
        required: [true, "Child category is required"],
        unique: true,
    },
}, { timestamps: true });
const ChildCategory = model("ChildCategory", childCategorySchema);
export default ChildCategory;
