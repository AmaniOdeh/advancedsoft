// 📁 controllers/donation.controller.js
const db = require("../db");
const sgMail = require("@sendgrid/mail");

// 📩 إعداد SendGrid API
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const validTypes = ["general", "education", "medical", "payment"];

exports.createDonation = (req, res) => {
  const userId = req.user.id;
  const {
    orphan_id,
    room_id,
    orphanage_id,
    type,
    amount,
    description,
    status,
  } = req.body;

  if (!validTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid donation type." });
  }

  const getDonorIdSql = "SELECT id FROM donors WHERE user_id = ?";

  db.query(getDonorIdSql, [userId], (err, donorResult) => {
    if (err) return res.status(500).json({ error: err });
    if (donorResult.length === 0)
      return res.status(404).json({ message: "Donor profile not found." });

    const donorId = donorResult[0].id;

    const sql = `INSERT INTO donations (donor_id, orphan_id, room_id, orphanage_id, type, amount, description, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

    db.query(
      sql,
      [
        donorId,
        orphan_id || null,
        room_id || null,
        orphanage_id || null,
        type,
        amount || null,
        description || null,
        status || "pending",
      ],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });

        const getEmailSql = "SELECT email, name FROM users WHERE id = ?";
        db.query(getEmailSql, [userId], (err3, userResult) => {
          if (!err3 && userResult.length > 0) {
            const donorEmail = userResult[0].email;
            const donorName = userResult[0].name;

            const msg = {
              to: donorEmail,
              from: {
                name: "HopeConnect Team 💚",
                email: process.env.EMAIL_USER,
              },
              subject: `Your HopeConnect Receipt – Thank you! 💚`,
              html: `
                <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
                  <h2 style="color:#388e3c;">🎉 Thank You for Your Donation!</h2>
                  <p>Dear ${donorName},</p>
                  <p>We deeply appreciate your <strong>${type}</strong> donation to HopeConnect. Your support helps us continue our mission to support orphans across Palestine.</p>
                  <p>🌱 <i>Together, we make a difference!</i></p>
                  <br/>
                  <p>With love,</p>
                  <p><strong>HopeConnect Team</strong><br/>
                  Ramallah, Palestine</p>
                </div>
              `,
            };

            sgMail
              .send(msg)
              .then(() => console.log("✅ SendGrid: Email sent."))
              .catch((error) => console.error("❌ SendGrid Error:", error));
          }
        });

        res.status(201).json({
          message: "Donation added successfully 🙌",
          donationId: result.insertId,
        });
      }
    );
  });
};

exports.getMyDonations = (req, res) => {
  const userId = req.user.id;
  const getDonorSql = "SELECT id FROM donors WHERE user_id = ?";

  db.query(getDonorSql, [userId], (err, donorResult) => {
    if (err) return res.status(500).json({ error: err });
    if (donorResult.length === 0)
      return res.status(404).json({ message: "Donor profile not found." });

    const donorId = donorResult[0].id;
    const sql = `SELECT * FROM donations WHERE donor_id = ? ORDER BY created_at DESC`;

    db.query(sql, [donorId], (err2, results) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ donations: results });
    });
  });
};

exports.updateDonation = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  if (updatedData.type && !validTypes.includes(updatedData.type)) {
    return res.status(400).json({ message: "Invalid donation type." });
  }

  const sql = "UPDATE donations SET ? WHERE id = ?";
  db.query(sql, [updatedData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Donation updated successfully ✏️" });
  });
};

exports.deleteDonation = (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM donations WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Donation deleted successfully 🗑️" });
  });
};

// ✅ تتبع تبرعات المتبرع (للوحة التتبع الشخصية)
exports.getMyDonationStats = (req, res) => {
    const userId = req.user.id;
    const getDonorIdSql = "SELECT id FROM donors WHERE user_id = ?";
  
    db.query(getDonorIdSql, [userId], (err, donorResult) => {
      if (err) return res.status(500).json({ error: err });
      if (donorResult.length === 0)
        return res.status(404).json({ message: "Donor profile not found." });
  
      const donorId = donorResult[0].id;
  
      const sql = `
        SELECT 
          COUNT(*) AS total_donations,
          COALESCE(SUM(amount), 0) AS total_amount,
          SUM(CASE WHEN type = 'general' THEN amount ELSE 0 END) AS general_total,
          SUM(CASE WHEN type = 'education' THEN amount ELSE 0 END) AS education_total,
          SUM(CASE WHEN type = 'medical' THEN amount ELSE 0 END) AS medical_total,
          SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) AS payment_total,
          MAX(created_at) AS latest_donation
        FROM donations
        WHERE donor_id = ?
      `;
  
      db.query(sql, [donorId], (err2, stats) => {
        if (err2) return res.status(500).json({ error: err2 });
        res.status(200).json({ tracking: stats[0] });
      });
    });
  };
  