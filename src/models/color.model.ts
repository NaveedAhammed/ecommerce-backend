import { Schema, model } from "mongoose";

export interface IColor {
  name: string;
  value: string;
}

const colorSchema = new Schema<IColor>(
  {
    name: {
      unique: true,
      type: String,
      required: [true, "Color name is required"],
    },
    value: {
      unique: true,
      type: String,
      required: [true, "Color value is required"],
    },
  },
  { timestamps: true }
);

const Color = model<IColor>("Color", colorSchema);

export default Color;
