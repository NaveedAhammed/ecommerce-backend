import { Schema, model } from "mongoose";

export interface ICategory {
  name: string;
}

const categorySchema = new Schema<ICategory>(
  {
    name: {
      unique: true,
      type: String,
      required: [true, "Category name is required"],
    },
  },
  { timestamps: true }
);

const Category = model<ICategory>("Category", categorySchema);

export default Category;
