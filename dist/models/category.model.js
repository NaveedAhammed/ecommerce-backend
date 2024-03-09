import { Schema, model } from "mongoose";
const categorySchema = new Schema({
    name: {
        unique: true,
        type: String,
        required: [true, "Category name is required"],
    },
}, { timestamps: true });
const Category = model("Category", categorySchema);
export default Category;
