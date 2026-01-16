// server/index.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// Routes
import authRoutes from "./routes/authRoutes.js";
import likeRoutes from "./routes/likeRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subCategoryRoutes from "./routes/subCategoryRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import translationRoutes from "./routes/translations.js";
import locationRoutes from "./routes/locationRoutes.js";
import specTemplateRoutes from "./routes/specTemplateRoutes.js";
import specConfigRoutes from "./routes/specConfigRoutes.js";

// Middleware
import { protect } from "./middleware/authMiddleware.js";
import adminRouter from "./admin/routes/admin.index.js";

dotenv.config();

const app = express();

// Railway автоматично надає PORT, для локалки лишаємо 5000
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --------------------------
// CORS - Налаштування для зв'язку з Vercel
// --------------------------
const corsOptions = {
  origin: CLIENT_URL,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

// Статика для завантаження фото
app.use("/uploads", express.static(path.join(process.cwd(), "public/uploads")));

// --------------------------
// API Routes (Магазин)
// --------------------------
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subCategoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/likes", protect, likeRoutes);
app.use("/api/translations", translationRoutes);
app.use("/api/locations", locationRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/spec-templates", specTemplateRoutes);
app.use("/api/spec-config", specConfigRoutes);

// Адмін-панель
app.use("/api/admin", adminRouter);

// Health check для перевірки Railway
app.get("/api/health", (req, res) => res.json({ ok: true, status: "Working" }));

// --------------------------
// Start Server & Connect DB
// --------------------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    // ВАЖЛИВО: додаємо '0.0.0.0' для Railway
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1); // Зупиняємо, якщо база не підключилась
  });