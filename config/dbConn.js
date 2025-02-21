const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL); 
        console.log('✅ Database Connected Successfully');

        // Handle MongoDB Disconnection Events
        mongoose.connection.on('disconnected', () => {
            console.log('⚠️ MongoDB Disconnected. Reconnecting...');
            connectDB();
        });

        // Graceful Shutdown Handling
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔴 MongoDB Disconnected on App Termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ Database Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
