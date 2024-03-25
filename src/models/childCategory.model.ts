import { Schema, Types, model } from "mongoose";
import { IParentCategory } from "./parentCategory.model.js";

export interface IChildCategory {
	parentCategory: Types.ObjectId | IParentCategory;
	name: string;
}

const childCategorySchema = new Schema<IChildCategory>(
	{
		parentCategory: {
			type: Types.ObjectId,
			required: [true, "Parent category is required"],
			ref: "ParentCategory",
		},
		name: {
			type: String,
			required: [true, "Child category is required"],
		},
	},
	{ timestamps: true }
);

const ChildCategory = model<IChildCategory>(
	"ChildCategory",
	childCategorySchema
);

export default ChildCategory;
