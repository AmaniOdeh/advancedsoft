const db = require("../db");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Create new sponsorship
exports.createSponsorship = (req, res) => {
  const userId = req.user.id;
  const {
    orphan_id,
    orphanage_id,
    monthly_amount,
    start_date,
    end_date,
    status,
    sponsorship_type_id,
    notes,
  } = req.body;

  if (!orphan_id || !monthly_amount || !start_date || !sponsorship_type_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  // ✅ Get sponsor_id from sponsors table
  db.query("SELECT id FROM sponsors WHERE user_id = ?", [userId], (err, sponsorResult) => {
    if (err) return res.status(500).json({ error: err });
    if (sponsorResult.length === 0) {
      return res.status(404).json({ message: "Sponsor profile not found." });
    }

    const sponsorId = sponsorResult[0].id;

    const sql = `
      INSERT INTO sponsorships 
      (sponsor_id, orphan_id, orphanage_id, monthly_amount, start_date, end_date, status, sponsorship_type_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(
      sql,
      [
        sponsorId,
        orphan_id,
        orphanage_id || null,
        monthly_amount,
        start_date,
        end_date || null,
        status || 'active',
        sponsorship_type_id,
        notes || null,
      ],
      (err2, result) => {
        if (err2) return res.status(500).json({ error: err2 });

        // ✅ Get sponsor email
        const getSponsorEmailSql = `
          SELECT u.email, u.name
          FROM users u
          JOIN sponsors s ON u.id = s.user_id
          WHERE s.id = ?
        `;

        db.query(getSponsorEmailSql, [sponsorId], (err3, emailResult) => {
          if (!err3 && emailResult.length > 0) {
            const { email, name } = emailResult[0];

            const msg = {
              to: email,
              from: {
                name: "HopeConnect 💚",
                email: process.env.EMAIL_USER,
              },
              subject: "🎉 Sponsorship Confirmation",
              html: `
                <h3>Dear ${name},</h3>
                <p>Thank you for sponsoring a child through HopeConnect!</p>
                <p>We are honored to have your support 💚</p>
                <p>— HopeConnect Team</p>
              `,
            };

            sgMail.send(msg)
              .then(() => console.log(`✅ Sponsorship email sent to ${email}`))
              .catch((err) => console.error(`❌ Email send failed to ${email}:`, err));
          }
        });

        res.status(201).json({
          message: "Sponsorship created successfully ✅",
          sponsorshipId: result.insertId,
        });
      }
    );
  });
};

// ✅ Get sponsor's own sponsorships (with orphan + orphanage info)
exports.getMySponsorships = (req, res) => {
  const userId = req.user.id;

  const sql = `
    SELECT s.*, st.name AS sponsorship_type_name,
           o.age AS orphan_age, o.education_status, o.health_condition,
           ou.name AS orphan_name, ou.email AS orphan_email, ou.phone_number AS orphan_phone,
           og.name AS orphanage_name
    FROM sponsorships s
    JOIN sponsorship_types st ON s.sponsorship_type_id = st.id
    JOIN sponsors sp ON sp.id = s.sponsor_id
    JOIN orphans o ON o.id = s.orphan_id
    JOIN users ou ON o.user_id = ou.id
    LEFT JOIN orphanages og ON og.id = COALESCE(s.orphanage_id, o.orphanage_id)
    WHERE sp.user_id = ?`;

  db.query(sql, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ sponsorships: results });
  });
};

// ✅ Update sponsorship
exports.updateSponsorship = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  db.query("UPDATE sponsorships SET ? WHERE id = ?", [updatedData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Sponsorship updated successfully ✅" });
  });
};

// ✅ Delete sponsorship
exports.deleteSponsorship = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM sponsorships WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Sponsorship deleted successfully 🗑️" });
  });
};

// ✅ Get available orphans (not already sponsored)
exports.getAvailableOrphans = (req, res) => {
  const sql = `
    SELECT o.*, u.name, u.email, u.phone_number
    FROM orphans o
    JOIN users u ON o.user_id = u.id
    WHERE o.id NOT IN (
      SELECT orphan_id FROM sponsorships WHERE status = 'active'
    )`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ available_orphans: results });
  });
};
