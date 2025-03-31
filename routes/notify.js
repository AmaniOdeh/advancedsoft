const db = require("../db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendExpiryNotifications = () => {
  const sql = `
    SELECT s.*, u.email, u.name FROM sponsorships s
    JOIN sponsors sp ON s.sponsor_id = sp.id
    JOIN users u ON sp.user_id = u.id
    WHERE DATEDIFF(s.end_date, CURDATE()) BETWEEN 0 AND 5
  `;

  db.query(sql, (err, results) => {
    if (err) return console.error("DB Error:", err);

    results.forEach((sponsorship) => {
      const mailOptions = {
        from: "your_email@gmail.com",
        to: sponsorship.email,
        subject: "⏳ Sponsorship Expiry Alert",
        text: `Hi ${sponsorship.name},\n\nYour sponsorship (ID: ${sponsorship.id}) is expiring on ${sponsorship.end_date}. Kindly consider renewing it.\n\nHopeConnect 💚`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log("Email Error:", error);
        else console.log("Email sent to:", sponsorship.email);
      });
    });
  });
};

module.exports = sendExpiryNotifications;
