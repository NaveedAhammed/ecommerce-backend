import mongoose from "mongoose";
const { Schema, model } = mongoose;
const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required."],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        validate: {
            validator: function (value) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
            },
            message: (props) => `${props.value} is not a valid email`,
        },
    },
    phone: {
        type: String,
        validate: {
            validator: function (value) {
                return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value);
            },
            message: (props) => `${props.value} is not a valid phone number`,
        },
    },
    avatar: {
        type: String,
    },
    role: {
        type: String,
        enum: {
            values: ["user", "admin"],
            message: "{VALUE} is not supported",
        },
        default: "user",
    },
    refreshToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
}, { timestamps: true });
const User = model("User", userSchema);
export default User;
