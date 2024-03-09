import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

interface IOrder {
  shippingInfo: IShippingInfo;
  orderItems: IOrderItem[];
  userId: Types.ObjectId;
  paymentInfo: string;
  paidAt?: Date;
  taxPrice: number;
  shippingPrice: number;
  orderStatus: string;
  orderedAt: Date;
  deliveredAt?: Date;
}

interface IShippingInfo {
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
  phone: number;
}

interface IOrderItem {
  title: string;
  price: string;
  quantity: string;
  image: string;
  productId: Types.ObjectId;
}

const orderSchema = new Schema<IOrder>({
  shippingInfo: {
    address: {
      type: String,
      required: [true, "Address is required"],
    },
    city: {
      type: String,
      required: [true, "City is required"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
    },
    country: {
      type: String,
      required: [true, "County is required"],
    },
    pincode: {
      type: Number,
      required: [true, "Pincode is required"],
    },
    phone: {
      type: Number,
      required: [true, "Phone number is required"],
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
  },
  orderItems: [
    {
      title: {
        type: String,
        required: [true, "Title is required"],
      },
      price: {
        type: Number,
        required: [true, "Price is required"],
      },
      quantity: {
        type: Number,
        required: [true, "Quantity is required"],
      },
      image: {
        type: String,
        required: [true, "Image is required"],
      },
      productId: {
        type: Schema.ObjectId,
        required: [true, "Product id is required"],
        ref: "Product",
      },
    },
  ],
  userId: {
    type: Schema.ObjectId,
    required: [true, "User id is required"],
    ref: "User",
  },
  paymentInfo: {
    type: String,
    enum: {
      values: ["pending", "success", "failed"],
      message: "{VALUE} is not supported",
    },
  },
  paidAt: {
    type: Date,
  },
  taxPrice: {
    type: Number,
    required: [true, "Tax price is required"],
  },
  shippingPrice: {
    type: Number,
    required: [true, "Shipping price is required"],
  },
  orderStatus: {
    type: String,
    required: [true, "Order status is required"],
    enum: {
      values: ["processing", "shipped", "delivered"],
      message: "{VALUE} is not supported",
    },
    default: "processing",
  },
  orderedAt: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  deliveredAt: Date,
});

const Order = model("Order", orderSchema);

export default Order;
