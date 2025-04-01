const express = require("express");
require("dotenv").config();

const app = express();
const authRoutes = require("./routes/auth.routes");
const orphanageRoutes = require("./routes/orphanage.routes");
const profileRoutes = require("./routes/profile.routes");
const sponsorshipRoutes = require("./routes/sponsorship.routes");
const reportsRoutes = require("./adminroutes/orphanReports.routes");
const cron = require("node-cron");
const sponsorAdminRoutes = require("./adminroutes/sponsorAdmin.routes");

const sendExpiryNotifications = require("./routes/notify");
cron.schedule("0 9 * * *", () => {
  // كل يوم الساعة 9 صباحًا
  console.log("Running expiry check...");
  sendExpiryNotifications();
});
const sendReportNotification = require("./utils/sendReportNotification");

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/orphanage", orphanageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/sponsorship", sponsorshipRoutes);
app.use("/api/reports", reportsRoutes);
sendExpiryNotifications(); // جربيها يدويًا
app.use("/api/admin/sponsorships", sponsorAdminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
