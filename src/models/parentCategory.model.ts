import { Schema, model } from "mongoose";

export interface IParentCategory {
	name: string;
}

const parentCategorySchema = new Schema<IParentCategory>(
	{
		name: {
			type: String,
			required: [true, "Parent category name is required"],
			unique: true,
		},
	},
	{ timestamps: true }
);

const ParentCategory = model<IParentCategory>(
	"ParentCategory",
	parentCategorySchema
);

export default ParentCategory;
