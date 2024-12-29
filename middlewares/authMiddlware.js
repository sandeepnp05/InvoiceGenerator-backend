import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();



const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    const SECRET_KEY = process.env.JWT_SECRET

    if (!token) {
        return res.status(401).json({ message: "Authentication token missing" });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.userId = decoded.id;
        next();
       
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

export default authMiddleware;
