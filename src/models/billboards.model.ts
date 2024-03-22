import { Schema, Types, model } from "mongoose";
import { ICategory } from "./category.model.js";

export interface IBillboard {
	title: string;
	category: Types.ObjectId | ICategory;
	imageUrl: string;
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
			ref: "Category",
		},
		imageUrl: {
			type: String,
			required: [true, "Billboard image is required"],
		},
	},
	{ timestamps: true }
);

const Billboard = model<IBillboard>("Billboard", categorySchema);

export default Billboard;
