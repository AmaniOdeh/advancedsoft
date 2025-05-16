const db = require("../db");
const sgMail = require("@sendgrid/mail");
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

  const targets = [orphan_id, room_id, orphanage_id].filter(Boolean);
  if (targets.length !== 1) {
    return res.status(400).json({
      message: "Please choose exactly one donation target: orphan_id, room_id, or orphanage_id.",
    });
  }

  const getDonorIdSql = "SELECT id FROM donors WHERE user_id = ?";
  db.query(getDonorIdSql, [userId], (err, donorResult) => {
    if (err) return res.status(500).json({ error: err });
    if (donorResult.length === 0) {
      return res.status(404).json({ message: "Donor profile not found." });
    }

    const donorId = donorResult[0].id;

    const sql = `
      INSERT INTO donations 
        (donor_id, orphan_id, room_id, orphanage_id, type, amount, description, status, created_at)
      VALUES 
        (?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

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

        // ✅ تحديث جدول donors تلقائيًا
        const updateDonorSql = `
          UPDATE donors 
          SET 
            total_donations = total_donations + 1,
            total_amount = total_amount + ?
          WHERE id = ?`;
        db.query(updateDonorSql, [amount || 0, donorId], (err4) => {
          if (err4) console.error("⚠️ Failed to update donor stats:", err4);
        });

        // ✅ إرسال إيميل شكر
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
                  <p>We deeply appreciate your <strong>${type}</strong> donation to HopeConnect.</p>
                  <p>🌱 <i>Together, we make a difference!</i></p>
                  <br/>
                  <p>With love,<br/><strong>HopeConnect Team</strong><br/>Ramallah, Palestine</p>
                </div>`,
            };

            sgMail
              .send(msg)
              .then(() => console.log("✅ SendGrid: Email sent."))
              .catch((error) => console.error("❌ SendGrid Error:", error));
          }
        });

        res.status(201).json({
          message: "Donation added successfully 🙌",
          donation: {
            id: result.insertId,
            type,
            amount,
            description,
            status: status || "pending",
            target: orphan_id
              ? { type: "orphan", id: orphan_id }
              : room_id
              ? { type: "room", id: room_id }
              : { type: "orphanage", id: orphanage_id },
          },
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
  let updatedData = { ...req.body };

  // ✅ تأكد من lowercase إذا تم تعديل النوع
  if (updatedData.type) {
    updatedData.type = updatedData.type.toLowerCase();
    const validTypes = ["general", "education", "medical", "payment"];
    if (!validTypes.includes(updatedData.type)) {
      return res.status(400).json({ message: "Invalid donation type." });
    }
  }

  const sql = "UPDATE donations SET ? WHERE id = ?";
  db.query(sql, [updatedData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation not found." });
    }
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
      WHERE donor_id = ?`;

    db.query(sql, [donorId], (err2, stats) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ tracking: stats[0] });
    });
  });
};
// ✅ دار الأيتام تعرض كل التبرعات إلها
exports.getOrphanageDonations = (req, res) => {
  const orphanage_id = req.user.orphanage_id;

  const sql = `
    SELECT d.*, u.name AS donor_name
    FROM donations d
    JOIN donors dn ON d.donor_id = dn.id
    JOIN users u ON dn.user_id = u.id
    WHERE d.orphanage_id = ?
    ORDER BY d.created_at DESC
  `;

  db.query(sql, [orphanage_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ donations: rows });
  });
};

// ✅ دار الأيتام تحدث الستاتس لتبرع
exports.updateDonationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "used", "forwarded","approved"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  const sql = `UPDATE donations SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Donation not found." });
    }
    res.status(200).json({ message: "Donation status updated ✅" });
  });
};
