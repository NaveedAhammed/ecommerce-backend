import { Schema, model } from "mongoose";
const unitSchema = new Schema({
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
}, { timestamps: true });
const Unit = model("Unit", unitSchema);
export default Unit;
