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
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.static('public'));

app.use(bodyParser.json());

app.use('/',userRoute);
app.use('/',pdfRoute);

const PORT = process.env.PORT || 5000;
// const DB_URI =process.env.MONGO_URI || "mongodb://localhost:27017/pdf-generator";
const DB_URI ="mongodb://localhost:27017/pdf-generator";
console.log(DB_URI)

mongoose.connect(DB_URI).then(() => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => console.error("DB connection error:", error));
 