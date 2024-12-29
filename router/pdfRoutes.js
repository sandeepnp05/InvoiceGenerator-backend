import express from "express";
import puppeteer from "puppeteer";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/authMiddlware.js";
import { User } from "../models/User.js";
import ejs from "ejs";

const router = express.Router();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


router.use("/pdfs", express.static(path.join(__dirname, "..", "pdfs")));

router.get("/generate-invoice", authMiddleware, async (req, res) => {
  let browser = null;
  try {
    const userId = req.userId;

    // Fetch user details
    const user = await User.findById(userId).populate("products");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch products associated with the user
    const products = user.products;
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for the user" });
    }

    // Calculate subTotal and total
    const subTotal = products.reduce((sum, product) => sum + product.price * product.quantity, 0);
    const total = subTotal * 1.18; 

   

    // Render EJS
    const invoiceHTML = await ejs.renderFile(path.join(__dirname,"..", "views", "invoice.ejs"), {
      user: user,
      products: products,
      subTotal: subTotal,
      total: total
    });

    
    const pdfDir = path.join(__dirname, "..", "pdfs");
    await fs.mkdir(pdfDir, { recursive: true });

    // Launch Puppeteer
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();
    await page.setContent(invoiceHTML, {
      waitUntil: ["domcontentloaded", "networkidle0"],
    });

    // Generate PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", bottom: "20px", left: "20px", right: "20px" },
    });

   
    const filename = `invoice_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(pdfDir, filename);

    // Save PDF locally
    await fs.writeFile(filePath, pdf);

    await browser.close(); 
    const downloadUrl = `${req.protocol}://${req.get("host")}/pdfs/${filename}`;
    res.json({ message: "Invoice generated successfully", url: downloadUrl });
  } catch (error) {
    console.error("Error generating invoice:", error);

  
    if (browser) {
      await browser.close();
    }

    res.status(500).json({
      message: "Failed to generate invoice",
      error: error.message,
    });
  }
});

export default router;
