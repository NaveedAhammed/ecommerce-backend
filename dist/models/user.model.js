import mongoose, { Types } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const { Schema, model } = mongoose;
const userSchema = new Schema({
    username: {
        type: String,
        unique: true,
        required: [true, "Username is required"],
        minlength: [3, "Min 3 characters are required"],
        maxlength: [24, "Max 24 characters are allowed"],
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
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    gender: {
        type: String,
        enum: {
            values: ["male", "female"],
            message: "{VALUE} is not supported",
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
    cart: [
        {
            quantity: {
                type: Number,
                required: [true, "Quantity is required"],
            },
            productId: {
                type: Types.ObjectId,
                required: [true, "Product id is required"],
                ref: "Product",
            },
        },
    ],
    wishlistIds: [
        {
            type: Types.ObjectId,
            ref: "Product",
        },
    ],
    shippingAddresses: [
        {
            name: {
                type: String,
                required: [true, "Name is required"],
            },
            phone: {
                type: Number,
                required: [true, "Name is required"],
                validate: {
                    validator: function (value) {
                        return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(value);
                    },
                    message: (props) => `${props.value} is not a valid phone number`,
                },
            },
            locality: {
                type: String,
                required: [true, "Locality is required"],
            },
            city: {
                type: String,
                required: [true, "City is required"],
            },
            state: {
                type: String,
                required: [true, "State is required"],
            },
            address: {
                type: String,
                required: [true, "Address is required"],
            },
            addressType: {
                type: String,
                required: [true, "Address type is required"],
            },
            pincode: {
                type: Number,
                required: [true, "Pincode is required"],
            },
            alternatePhone: Number,
        },
    ],
    refreshToken: {
        type: String,
    },
    resetPasswordExpire: {
        type: Date,
    },
    resetPasswordToken: {
        type: String,
    },
    myReviews: [
        {
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
            postedAt: {
                type: Date,
                default: Date.now(),
            },
            productId: {
                type: Types.ObjectId,
                required: [true, "Product id is required"],
                ref: "Product",
            },
        },
    ],
}, { timestamps: true });
userSchema.pre("save", async function (next) {
    if (!this.isModified("password"))
        return next();
    this.password = await bcryptjs.hash(this.password, 10);
    next();
});
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcryptjs.compare(password, this.password);
};
userSchema.methods.generateAccessToken = function () {
    return jwt.sign({ id: this._id, email: this.email, username: this.username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    });
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({ id: this._id, username: this.username }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    });
};
userSchema.methods.generateResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    return resetToken;
};
const User = model("User", userSchema);
export default User;
