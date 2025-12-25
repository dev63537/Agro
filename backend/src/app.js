console.log("app come");

const express = require("express");
require("express-async-errors");
const morgan = require("morgan");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth.routes");
const masterRoutes = require("./routes/master.routes");
const shopRoutes = require("./routes/shop.routes");
const productRoutes = require("./routes/product.routes");
const stockRoutes = require("./routes/stock.routes");
const farmerRoutes = require("./routes/farmer.routes");
const billingRoutes = require("./routes/billing.routes");
const ledgerRoutes = require("./routes/ledger.routes");
const reportsRoutes = require("./routes/reports.routes");
const masterReportsRoutes = require("./routes/masterReports.routes");

const { errorHandler } = require("./middleware/error.handler");

const app = express();

/* ===============================
   MIDDLEWARE
================================ */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
  })
);

app.use(morgan("dev"));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

/* ===============================
   STATIC FILES (PDF / SIGNATURES)
================================ */
if ((process.env.STORAGE_DRIVER || "local") === "local") {
  const uploadPath =
    process.env.LOCAL_STORAGE_PATH ||
    path.join(__dirname, "..", "uploads");

  app.use("/uploads", express.static(uploadPath));
}

/* ===============================
   ROUTES
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/shops", shopRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/farmers", farmerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/master/reports", masterReportsRoutes);

/* ===============================
   HEALTH CHECK
================================ */
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date() });
});

/* ===============================
   ERROR HANDLER (LAST)
================================ */
app.use(errorHandler);

module.exports = app;