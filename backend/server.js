import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import listEndpoints from 'express-list-endpoints';
import dotenv from 'dotenv';

import { checkDbConnection } from './middleware/checkDbConnection.js';
import { errorHandler } from './middleware/errorHandler.js';

import { userRoutes } from './routes/userRoutes.js';
import { tripRoutes } from './routes/tripRoutes.js';
import { authRoutes } from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();

// MongoDB connection
const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/traktamente';
mongoose.connect(mongoUrl);
mongoose.Promise = Promise;

// Middleware to check MongoDB connection
app.use(checkDbConnection);

// Middleware Error handler
app.use(errorHandler);

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/users', userRoutes);
app.use('/trips', tripRoutes);

// App endpoints documentation
app.get('/', (req, res) => {
  const endpoints = listEndpoints(app);
  res.send({
    message: 'Welcome to my API endpoints - Traktamente',
    endpoints: endpoints,
  });
});

// Start the server
// PORT=9000 npm start
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
