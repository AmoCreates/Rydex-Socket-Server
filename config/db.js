import mongoose from "mongoose";

const dbConnection = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`)
    console.log('DATABASE CONNECTED SUCCESSFULLY');
  } catch (error) {
    console.log(`Mongoose connection error!, Database connection Failed\nerr: ${err}`);
  }
}

export default dbConnection;