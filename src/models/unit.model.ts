import { Schema, model } from "mongoose";

export interface IUnit {
	name: string;
	value: string;
	shortHand?: string;
}

const unitSchema = new Schema<IUnit>(
	{
		name: {
			type: String,
			required: [true, "Unit name is required"],
		},
		value: {
			type: String,
			required: [true, "Unit value is required"],
			unique: true,
		},
		shortHand: {
			type: String,
		},
	},
	{ timestamps: true }
);

const Unit = model<IUnit>("Unit", unitSchema);

export default Unit;
