import mongoose from 'mongoose';

const connectMongo = async () => {
  try {
    // Check if the connection is already established
    // console.log(process.env.MONGODB_URI);

    if (mongoose.connections[0].readyState) {
      const { connection } = await mongoose.connect(process.env.MONGODB_URI);

      if (connection.readyState === 1) {
        return true; // Connection is successful
      }

      return false; // Connection state is not ready
    }

    // Establish a new database connection
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000, // Increase timeout to 20 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
    });

    return true; // New connection is successful
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return Promise.reject(error); // Reject the promise with the error
  }
};

export default connectMongo;