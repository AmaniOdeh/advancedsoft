const db = require("../db");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReportNotification = (orphan_id, report_type, report_date) => {
  // 1. Get the sponsor email linked to the orphan
  const sql = `
    SELECT u.email, u.name AS sponsor_name, o.id AS orphan_id, ou.name AS orphan_name
    FROM sponsorships s
    JOIN sponsors sp ON s.sponsor_id = sp.id
    JOIN users u ON sp.user_id = u.id
    JOIN orphans o ON s.orphan_id = o.id
    JOIN users ou ON o.user_id = ou.id
    WHERE s.status = 'active' AND s.orphan_id = ?
  `;

  db.query(sql, [orphan_id], (err, results) => {
    if (err) return console.error("Notification Error (DB):", err);

    if (results.length === 0) return;

    const sponsor = results[0];

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: sponsor.email,
      subject: `📢 New Update for ${sponsor.orphan_name}`,
      html: `
        <h3>Dear ${sponsor.sponsor_name},</h3>
        <p>We wanted to inform you that a new <strong>${report_type}</strong> has been added for your sponsored orphan <strong>${sponsor.orphan_name}</strong>.</p>
        <p><strong>Date:</strong> ${report_date}</p>
        <br>
        <p>With care,</p>
        <p>💚 HopeConnect Team</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("Email Send Error:", error);
      else console.log(`✅ Notification sent to sponsor: ${sponsor.email}`);
    });
  });
};

module.exports = sendReportNotification;
