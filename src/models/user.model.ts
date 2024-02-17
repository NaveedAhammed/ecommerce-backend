import mongoose, { Types } from "mongoose";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const { Schema, model } = mongoose;

interface IUser {
  username: string;
  email: string;
  password: string;
  gender: string;
  phone?: number;
  avatar?: string;
  role: string;
  cart?: ICartItem[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  refreshToken: string;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
  generateResetPasswordToken(): string;
}

interface ICartItem {
  image: string;
  title: string;
  price: number;
  discount?: number;
  quantity: number;
  productId: Types.ObjectId;
}

const userSchema = new Schema<IUser>(
  {
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
        validator: function (value: string) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
        },
        message: (props: mongoose.ValidatorProps) =>
          `${props.value} is not a valid email`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female"],
        message: "{VALUE} is not supported",
      },
    },
    phone: {
      type: String,
      validate: {
        validator: function (value: string) {
          return /^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/.test(
            value
          );
        },
        message: (props: mongoose.ValidatorProps) =>
          `${props.value} is not a valid phone number`,
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
        image: {
          type: String,
          required: [true, "Image is required"],
        },
        title: {
          type: String,
          required: [true, "Title is required"],
        },
        price: {
          type: Number,
          required: [true, "Price is required"],
        },
        discount: {
          type: Number,
          default: 0,
        },
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
    refreshToken: {
      type: String,
    },
    resetPasswordExpire: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcryptjs.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function (): string {
  return jwt.sign(
    { id: this._id, email: this.email, username: this.username },
    process.env.ACCESS_TOKEN_SECRET as string,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function (): string {
  return jwt.sign(
    { id: this._id },
    process.env.REFRESH_TOKEN_SECRET as string,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateResetPasswordToken = function (): string {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

const User = model<IUser>("User", userSchema);

export default User;
