const express = require("express");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/auth.routes");
const orphanageRoutes = require("./routes/orphanage.routes");
const profileRoutes = require("./routes/profile.routes");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/orphanage", orphanageRoutes);
app.use("/api/profile", profileRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
