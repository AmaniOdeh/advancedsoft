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
const donationRoutes = require("./routes/donation.routes");
const deliveryRoutes = require('./routes/delivery.routes');
const transactionRoutes = require('./routes/transactions.routes');
const partnerRoutes = require('./routes/partners.routes');
const paymentRoutes = require("./routes/payment.routes");
const sendExpiryNotifications = require("./routes/notify");
const orphanReportRoutes = require("./routes/orphanReports");
app.use(express.json()); // لازم تكون قبل routes
const volunteerRoutes = require("./routes/Volunteer");

app.use("/api/orphan-reports", orphanReportRoutes);
cron.schedule("0 9 * * *", () => {
  // كل يوم الساعة 9 صباحًا
  console.log("Running expiry check...");
  sendExpiryNotifications();
});
const sendReportNotification = require("./utils/sendReportNotification");
app.use("/api/volunteers", volunteerRoutes);

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/orphanage", orphanageRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/sponsorship", sponsorshipRoutes);
app.use("/api/reports", reportsRoutes);
sendExpiryNotifications(); // جربيها يدويًا
app.use("/api/admin/sponsorships", sponsorAdminRoutes);
app.use("/api/donations", donationRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/partners', partnerRoutes);


app.use("/api/payment", paymentRoutes);
app.use("/uploads", express.static("public/uploads"));
app.use("/reports", express.static("public/reports"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
app.get("/success", (req, res) => {
  res.send("✅ Payment Successful! You can now record the donation.");
});
