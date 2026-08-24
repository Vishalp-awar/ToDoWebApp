import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import todoRoutes from './routes/todos.js';

const app = express();
const port = Number(process.env.PORT) || 5000;
const allowedOrigins = process.env.CLIENT_ORIGIN?.split(',').map((origin) => origin.trim()).filter(Boolean) ?? [];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by CORS.'));
  }
}));
app.use(express.json());

app.get('/api/health', (_request, response) => response.json({ status: 'ok' }));
app.use('/api/todos', todoRoutes);

app.use((error, _request, response, _next) => {
  if (error.name === 'ValidationError') {
    return response.status(400).json({ message: Object.values(error.errors)[0].message });
  }
  console.error(error);
  return response.status(500).json({ message: 'Something went wrong on the server.' });
});

if (!process.env.MONGODB_URI) {
  console.error('MONGODB_URI is required. Add it to server/.env.');
  process.exit(1);
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API listening on port ${port}`)))
  .catch((error) => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
