import mongoose from "mongoose";
import { ProductModel } from "../infrastructure/models/product.model";
import { env } from "../config/env";

const SAMPLE_PRODUCTS = [
  {
    name: "Wireless Headphones Pro",
    price: 199.99,
    category: "Electronics",
    stock: 50,
    description: "High-quality wireless headphones with noise cancellation and 30-hour battery life",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop"
  },
  {
    name: "Ultra-Fast USB-C Hub",
    price: 79.99,
    category: "Electronics",
    stock: 100,
    description: "7-in-1 USB-C hub with 4K HDMI, 3x USB 3.0, SD card reader, and Power Delivery",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop"
  },
  {
    name: "Mechanical Gaming Keyboard",
    price: 149.99,
    category: "Electronics",
    stock: 35,
    description: "RGB mechanical gaming keyboard with customizable switches and programmable keys",
    image: "https://images.unsplash.com/photo-1587829191301-51f5a9c16e44?w=500&h=500&fit=crop"
  },
  {
    name: "4K Webcam",
    price: 299.99,
    category: "Electronics",
    stock: 25,
    description: "Professional 4K webcam with auto-focus, built-in microphone, and wide-angle lens",
    image: "https://images.unsplash.com/photo-1598919374764-9a96ae8e8b13?w=500&h=500&fit=crop"
  },
  {
    name: "Premium Monitor Stand",
    price: 89.99,
    category: "Office Supplies",
    stock: 60,
    description: "Adjustable aluminum monitor stand with storage drawer and cable management",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop"
  },
  {
    name: "Ergonomic Office Chair",
    price: 399.99,
    category: "Office Supplies",
    stock: 20,
    description: "Premium ergonomic chair with lumbar support, armrests, and memory foam cushion",
    image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=500&h=500&fit=crop"
  },
  {
    name: "Portable SSD 1TB",
    price: 129.99,
    category: "Storage",
    stock: 75,
    description: "Fast 1TB portable SSD with USB-C, read speeds up to 1050MB/s",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop"
  },
  {
    name: "Wireless Mouse & Keyboard Combo",
    price: 59.99,
    category: "Electronics",
    stock: 120,
    description: "Sleek wireless keyboard and mouse combo with 2.4GHz connection, 2-year battery",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop"
  },
  {
    name: "USB-C Charging Cable 3-Pack",
    price: 19.99,
    category: "Cables & Adapters",
    stock: 500,
    description: "Durable 6ft USB-C charging cables, pack of 3, supports fast charging",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop"
  },
  {
    name: "HDMI 2.1 Cable",
    price: 24.99,
    category: "Cables & Adapters",
    stock: 200,
    description: "High-speed HDMI 2.1 cable, 48Gbps bandwidth, supports 8K@60Hz",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop"
  },
  {
    name: "Laptop Stand Aluminum",
    price: 49.99,
    category: "Office Supplies",
    stock: 80,
    description: "Portable aluminum laptop stand, adjustable angles, supports up to 17 inches",
    image: "https://images.unsplash.com/photo-1559056199-641a0ac8b3f4?w=500&h=500&fit=crop"
  },
  {
    name: "Powered USB Hub 7-Port",
    price: 39.99,
    category: "Electronics",
    stock: 90,
    description: "7-port USB 3.0 hub with individual power switches and 60W power adapter",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=500&h=500&fit=crop"
  },
  {
    name: "Wireless Charging Pad",
    price: 29.99,
    category: "Electronics",
    stock: 150,
    description: "Fast 15W wireless charging pad, compatible with all Qi-enabled devices",
    image: "https://images.unsplash.com/photo-1605559424843-9e4c3a1e2b04?w=500&h=500&fit=crop"
  },
  {
    name: "External Hard Drive 2TB",
    price: 79.99,
    category: "Storage",
    stock: 110,
    description: "Portable 2TB external hard drive with USB 3.0, backup software included",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=500&fit=crop"
  },
  {
    name: "Anti-Glare Screen Protector",
    price: 14.99,
    category: "Accessories",
    stock: 300,
    description: "Anti-glare screen protector for 27-inch monitors, reduces eye strain",
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop"
  }
];

async function seedProducts() {
  try {
    // Connect to MongoDB
    const mongoUri = env.MONGODB_URI || "mongodb://127.0.0.1:27017/ecommerce_products";
    await mongoose.connect(mongoUri);
    console.log("✓ Connected to MongoDB");

    // Delete existing products first
    await ProductModel.deleteMany({});
    console.log("✓ Cleared existing products");

    // Insert sample products
    const inserted = await ProductModel.insertMany(SAMPLE_PRODUCTS);
    console.log(`✓ Inserted ${inserted.length} products into the database`);

    // Verify insertion
    const totalCount = await ProductModel.countDocuments();
    console.log(`✓ Total products in database: ${totalCount}`);

    await mongoose.disconnect();
    console.log("✓ Seeding complete. Disconnected from MongoDB.");
  } catch (error) {
    console.error("✗ Seeding failed:", error);
    process.exit(1);
  }
}

seedProducts();
