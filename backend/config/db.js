import mongoose from "mongoose";

export default async function connectDB() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected");
}
