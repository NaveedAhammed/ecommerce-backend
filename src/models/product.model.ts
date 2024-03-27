import { Schema, Types, model } from "mongoose";
import { IChildCategory } from "./childCategory.model.js";

export interface IProduct {
	title: string;
	description: string;
	price: number;
	stock: number;
	discount?: number;
	images: ImageType[];
	numRating?: number;
	category: Types.ObjectId | IChildCategory;
	color?: Types.ObjectId;
	unit?: Types.ObjectId;
	reviews: IReview[];
	featured: boolean;
}

export type ImageType = {
	url: string;
};

export interface IReview {
	userId: Types.ObjectId;
	username: string;
	numRating: number;
	comment: string;
}

const productSchema = new Schema<IProduct>(
	{
		title: {
			type: String,
			required: [true, "Product title is required"],
		},
		description: {
			type: String,
			required: [true, "Product description is required"],
		},
		price: {
			type: Number,
			required: [true, "Product price is required"],
			min: [1, "Product price should not be negative or zero"],
		},
		stock: {
			type: Number,
			required: [true, "Product stock is required"],
			min: [1, "Product stock should be atleast 1"],
			max: [20, "Product stock cannot be more than 20"],
		},
		discount: {
			type: Number,
			default: 0,
		},
		color: {
			type: Types.ObjectId,
			ref: "Color",
		},
		unit: {
			type: Types.ObjectId,
			ref: "Unit",
		},
		featured: {
			type: Boolean,
			default: false,
		},
		images: [
			{
				url: {
					type: String,
				},
				id: {
					type: String,
				},
			},
		],
		numRating: {
			type: Number,
			default: 0,
		},
		category: {
			type: Types.ObjectId,
			ref: "ChildCategory",
			required: [true, "Product category is required"],
		},
		reviews: [
			{
				userId: {
					type: Types.ObjectId,
					required: [true, "User id is required"],
					ref: "User",
				},
				username: {
					type: String,
					required: [true, "Username is required"],
				},
				numRating: {
					type: Number,
					required: [true, "User rating is required"],
					min: [1, "Min rating is 1"],
					max: [5, "Max rating is 5"],
				},
				comment: {
					type: String,
					required: [true, "Comment is required"],
				},
			},
		],
	},
	{ timestamps: true }
);

const Product = model<IProduct>("Product", productSchema);

export default Product;
