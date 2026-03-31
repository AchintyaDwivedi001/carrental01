import mongoose from "mongoose";

let isConnected = false;

export default async function connect() {
  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    // Let's print the URL to the terminal to prove it exists!
    console.log("Checking ENV variable:",process.env.MONGODB_URI);

    // Make sure this exactly matches what is in your .env file
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env file");
    }

    const db = await mongoose.connect(process.env.MONGODB_URI);

    isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB Connection Error Details:", error);
    throw new Error("Failed to connect to MongoDB");
  }
}