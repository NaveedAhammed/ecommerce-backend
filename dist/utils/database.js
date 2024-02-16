import mongoose from "mongoose";
const connect = async () => {
    try {
        mongoose.connect(process.env.MONGO_DB_URL);
        console.log("Database connected successfully!");
    }
    catch (err) {
        console.log(err);
    }
};
export { connect };
