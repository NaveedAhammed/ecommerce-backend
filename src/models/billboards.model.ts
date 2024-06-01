import { Schema, Types, model } from "mongoose";
import { IParentCategory } from "./parentCategory.model.js";
import { IChildCategory } from "./childCategory.model.js";

export interface IBillboard {
	title: string;
	parentCategory: Types.ObjectId | IParentCategory;
	category: Types.ObjectId | IChildCategory;
	imageUrl: string;
	isActive: boolean;
	brand: string;
}

const categorySchema = new Schema<IBillboard>(
	{
		title: {
			unique: true,
			type: String,
			required: [true, "Billboard title is required"],
		},
		parentCategory: {
			type: Types.ObjectId,
			required: true,
			ref: "ParentCategory",
		},
		category: {
			type: Types.ObjectId,
			required: true,
			ref: "ChildCategory",
		},
		imageUrl: {
			type: String,
			required: [true, "Billboard image is required"],
		},
		isActive: {
			type: Boolean,
			default: false,
		},
		brand: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Billboard = model<IBillboard>("Billboard", categorySchema);

export default Billboard;
