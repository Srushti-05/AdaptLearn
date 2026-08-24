const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let uri = process.env.MONGO_URI;

    if (!uri || uri === 'your_mongodb_cluster_uri_here') {
      console.log('No MONGO_URI provided. Starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      uri = mongoServer.getUri();
    }

    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (process.env.NODE_ENV !== 'development') {
      process.exit(1);
    }
  }
};

module.exports = connectDB;

