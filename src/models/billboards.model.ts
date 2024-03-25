import { Schema, Types, model } from "mongoose";
import { IParentCategory } from "./parentCategory.model.js";

export interface IBillboard {
	title: string;
	category: Types.ObjectId | IParentCategory;
	imageUrl: string;
	isActive: boolean;
}

const categorySchema = new Schema<IBillboard>(
	{
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
	},
	{ timestamps: true }
);

const Billboard = model<IBillboard>("Billboard", categorySchema);

export default Billboard;
