import { Schema, model } from "mongoose";
const categorySchema = new Schema({
    parentCategory: {
        type: String,
        required: [true, "Category name is required"],
    },
    childCategory: {
        type: String,
    },
}, { timestamps: true });
const Category = model("Category", categorySchema);
export default Category;
