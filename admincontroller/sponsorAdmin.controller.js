// 📁 controllers/admincontroller/sponsorAdmin.controller.js
const db = require("../db");

// ✅ عرض جميع الكفالات
exports.getAllSponsorships = (req, res) => {
  const sql = `
    SELECT s.*, u.name AS sponsor_name, u.email AS sponsor_email, st.name AS sponsorship_type
    FROM sponsorships s
    JOIN sponsors sp ON s.sponsor_id = sp.id
    JOIN users u ON sp.user_id = u.id
    JOIN sponsorship_types st ON s.sponsorship_type_id = st.id
    ORDER BY s.start_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ all_sponsorships: results });
  });
};

// ✅ إضافة كفالة جديدة من قبل الأدمن
exports.createSponsorship = (req, res) => {
  const {
    sponsor_id,
    orphan_id,
    orphanage_id,
    monthly_amount,
    start_date,
    end_date,
    status,
    sponsorship_type_id,
    notes,
  } = req.body;

  if (!sponsor_id || !orphan_id || !monthly_amount || !start_date || !sponsorship_type_id) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const sql = `INSERT INTO sponsorships (sponsor_id, orphan_id, orphanage_id, monthly_amount, start_date, end_date, status, sponsorship_type_id, notes)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(
    sql,
    [
      sponsor_id,
      orphan_id,
      orphanage_id || null,
      monthly_amount,
      start_date,
      end_date || null,
      status || 'active',
      sponsorship_type_id,
      notes || null,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.status(201).json({ message: "Sponsorship created successfully ✅", sponsorshipId: result.insertId });
    }
  );
};

// ✅ تعديل كفالة موجودة
exports.updateSponsorship = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  db.query("UPDATE sponsorships SET ? WHERE id = ?", [updatedData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Sponsorship updated successfully ✅" });
  });
};

// ✅ حذف كفالة
exports.deleteSponsorship = (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM sponsorships WHERE id = ?", [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Sponsorship deleted successfully 🗑️" });
  });
};
