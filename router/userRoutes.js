import express from "express";
import jwt from "jsonwebtoken";
import {User,Product} from "../models/User.js"
import bcrypt from 'bcrypt'
import authMiddleware from "../middlewares/authMiddlware.js";
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;



router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    try {
    
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: "User already exists" });
  
   
      const saltRounds = 10; 
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({ name, email, password: hashedPassword });
      await user.save();
  
  
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
  
 
      res.status(201).json({
        user: { id: user._id, name: user.name, email: user.email },
        token,
      });
    } catch (error) {
      res.status(500).json({ message: "Registration failed", error });
    }
  });

// Login route

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const user = await User.findOne({ email }); 
     
      if (!user) return res.status(404).json({ message: "User not found" });
  
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
     
      if (!isPasswordValid) return res.status(401).json({ message: "Invalid credentials" });
  
      const token = jwt.sign({ id: user._id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
  
      res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email 
        },
        token
      });
    } catch (error) {
      res.status(500).json({ message: "Login failed", error });
    }
  });

  router.post("/addProduct", authMiddleware, async (req, res) => {
    const { productName, quantity, price } = req.body;
    const userId = req.userId;
   

    try {
 
        const newProduct = new Product({
            productName,
            quantity,
            price,
        });
   
        await newProduct.save();

        
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.products.push(newProduct._id);
        await user.save();

        res.status(201).json({
            message: "Product added successfully",
            product: newProduct,
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to add product", error });
    }
});


router.get('/products', authMiddleware, async (req, res) => {
  try {
    const products = await Product.find(); 
    res.status(200).json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
export default router;
