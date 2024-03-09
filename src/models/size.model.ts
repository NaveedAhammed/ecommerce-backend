import { Schema, model } from "mongoose";

export interface ISize {
  name: string;
  value: string;
}

const sizeSchema = new Schema<ISize>(
  {
    name: {
      type: String,
      required: [true, "Size name is required"],
      unique: true,
    },
    value: {
      type: String,
      required: [true, "Size value is required"],
      unique: true,
    },
  },
  { timestamps: true }
);

const Size = model<ISize>("Size", sizeSchema);

export default Size;
