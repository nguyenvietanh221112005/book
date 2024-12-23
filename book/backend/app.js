const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const fieldRoutes = require("./routes/fieldRoutes");
const bookingRoutes = require("./routes/bookingRoutes");

const app = express();

// Cấu hình CORS cho phép frontend truy cập
app.use(cors({
    origin: '*', // Cho phép tất cả các domain
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
app.use(bodyParser.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/bookings", bookingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi server!' });
});

const PORT = 2211;
app.listen(PORT, () => console.log(`Server đang chạy trên port ${PORT}`));