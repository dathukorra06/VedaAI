import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/vedaai');
        console.log('MongoDB Connected');
    } catch (error) {
        console.error('\n❌ MONGODB CONNECTION ERROR: Could not connect to MongoDB at 127.0.0.1:27017. Please ensure MongoDB is running locally or provide a valid MONGODB_URI in the backend .env! The server will remain up, but API calls will fail.\n');
    }
};

export default connectDB;
