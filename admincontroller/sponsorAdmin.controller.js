// 📁 controllers/orphanagecontroller/sponsorship.controller.js
const db = require("../db");

// ✅ عرض جميع الكفالات الخاصة بهذه دار الأيتام
exports.getAllSponsorships = (req, res) => {
  const orphanage_id = req.user.orphanage_id;

  const sql = `
    SELECT s.*, u.name AS sponsor_name, u.email AS sponsor_email, st.name AS sponsorship_type,
           ou.name AS orphan_name
    FROM sponsorships s
    JOIN sponsors sp ON s.sponsor_id = sp.id
    JOIN users u ON sp.user_id = u.id
    JOIN sponsorship_types st ON s.sponsorship_type_id = st.id
    JOIN orphans o ON s.orphan_id = o.id
    JOIN users ou ON o.user_id = ou.id
    WHERE s.orphanage_id = ?
    ORDER BY s.start_date DESC`;

  db.query(sql, [orphanage_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ sponsorships: results });
  });
};

// ✅ إضافة كفالة جديدة من قبل دار الأيتام
exports.createSponsorship = (req, res) => {
  const orphanage_id = req.user.orphanage_id;
  const {
    sponsor_id,
    orphan_id,
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
      orphanage_id,
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

// ✅ تعديل كفالة موجودة من قبل دار الأيتام
exports.updateSponsorship = (req, res) => {
  const { id } = req.params;
  const orphanage_id = req.user.orphanage_id;
  const updatedData = req.body;

  const checkSql = `SELECT id FROM sponsorships WHERE id = ? AND orphanage_id = ?`;
  db.query(checkSql, [id, orphanage_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(403).json({ message: "Not authorized to modify this sponsorship." });

    db.query("UPDATE sponsorships SET ? WHERE id = ?", [updatedData, id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ message: "Sponsorship updated successfully ✅" });
    });
  });
};

// ✅ حذف كفالة من قبل دار الأيتام
exports.deleteSponsorship = (req, res) => {
  const { id } = req.params;
  const orphanage_id = req.user.orphanage_id;

  const checkSql = `SELECT id FROM sponsorships WHERE id = ? AND orphanage_id = ?`;
  db.query(checkSql, [id, orphanage_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    if (results.length === 0)
      return res.status(403).json({ message: "Not authorized to delete this sponsorship." });

    db.query("DELETE FROM sponsorships WHERE id = ?", [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ message: "Sponsorship deleted successfully 🗑️" });
    });
  });
};
// ✅ عرض الكفالات التي تنتهي خلال 7 أيام فقط لدار الأيتام الحالي
exports.getEndingSoonSponsorships = (req, res) => {
  const orphanage_id = req.user.orphanage_id;

  const sql = `
    SELECT s.*, u.name AS sponsor_name, u.email AS sponsor_email,
           ou.name AS orphan_name, DATEDIFF(s.end_date, CURDATE()) AS days_left
    FROM sponsorships s
    JOIN sponsors sp ON s.sponsor_id = sp.id
    JOIN users u ON sp.user_id = u.id
    JOIN orphans o ON s.orphan_id = o.id
    JOIN users ou ON o.user_id = ou.id
    WHERE s.orphanage_id = ?
      AND s.status = 'active'
      AND s.end_date IS NOT NULL
      AND DATEDIFF(s.end_date, CURDATE()) BETWEEN 0 AND 7
    ORDER BY s.end_date ASC
  `;

  db.query(sql, [orphanage_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ ending_soon: results });
  });
};

