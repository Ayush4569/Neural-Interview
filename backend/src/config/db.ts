import mongoose from 'mongoose';

const connectDB = async () => {
  try {
   const connectionInstance = await mongoose.connect(process.env.MONGODB_URI as string);
     console.log("Database connected successfully",connectionInstance.connection.name);
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};

export default connectDB;
