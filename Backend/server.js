import express from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import albumRoutes from './routes/albumRoutes.js';
import artistRoutes from './routes/artistRoutes.js';

dotenv.config();
connectDB();

const app=express();

// Configure CORS to only allow requests from localhost:5173
const corsOptions = {
  origin: 'http://localhost:5173',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/music', musicRoutes);
app.use('/api/albums', albumRoutes);
app.use('/api/artists',artistRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`Server is running on PORT ${PORT}`));