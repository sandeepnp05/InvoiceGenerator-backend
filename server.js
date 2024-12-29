import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from './router/userRoutes.js'
import pdfRoute from './router/pdfRoutes.js'

dotenv.config();

const app = express();
app.use(cors({
  origin: [
    'https://invoice-generator-react-dj3m-fgchwc37c.vercel.app',  
    'https://inovice-generator-react-dj3m-lrt0h3j8m.vercel.app', 
    
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.static('public'));

app.use(bodyParser.json());

app.use('/',userRoute);
app.use('/',pdfRoute);

const PORT = process.env.PORT || 5000;
const DB_URI =process.env.MONGO_URI;
// const DB_URI ="mongodb://localhost:27017/pdf-generator";


mongoose.connect(DB_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => console.error("DB connection error:", error));
 