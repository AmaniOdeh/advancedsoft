const db = require("../db");
const sendReportNotification = require("../utils/sendReportNotification");

// 📌 إنشاء تقرير جديد ليتيم
exports.createReport = (req, res) => {
  const { orphan_id, report_type, description, photo_url, report_date } = req.body;

  if (!orphan_id || !report_type || !report_date) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const sql = `
    INSERT INTO orphan_reports (orphan_id, report_type, description, photo_url, report_date)
    VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [orphan_id, report_type, description || null, photo_url || null, report_date], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // ✉️ Send Notification to sponsor
    sendReportNotification(orphan_id, report_type, report_date);

    res.status(201).json({ message: "Report created successfully 📝", reportId: result.insertId });
  });
};

// 📌 عرض تقارير يتيم معيّن
exports.getReportsByOrphan = (req, res) => {
  const { orphan_id } = req.params;

  const sql = `
    SELECT r.*, u.name AS orphan_name
    FROM orphan_reports r
    JOIN orphans o ON r.orphan_id = o.id
    JOIN users u ON o.user_id = u.id
    WHERE r.orphan_id = ?
    ORDER BY r.report_date DESC`;

  db.query(sql, [orphan_id], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ reports: results });
  });
};

// 📌 عرض جميع التقارير (لأغراض الأدمن)
exports.getAllReports = (req, res) => {
  const sql = `
    SELECT r.*, u.name AS orphan_name
    FROM orphan_reports r
    JOIN orphans o ON r.orphan_id = o.id
    JOIN users u ON o.user_id = u.id
    ORDER BY r.report_date DESC`;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ all_reports: results });
  });
};

// 📌 تعديل تقرير
// 📌 تعديل تقرير
exports.updateReport = (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  const sql = "UPDATE orphan_reports SET ? WHERE id = ?";

  db.query(sql, [updatedData, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    // ✅ بعد التعديل، نجيب بيانات اليتيم المرتبط بالتقرير عشان نبعت تنبيه
    const orphanIdQuery = "SELECT orphan_id FROM orphan_reports WHERE id = ?";
    db.query(orphanIdQuery, [id], (err2, results) => {
      if (err2 || results.length === 0) {
        return res.status(500).json({ message: "Report updated, but failed to notify sponsor." });
      }

      const orphan_id = results[0].orphan_id;
      const { report_type, report_date } = updatedData;

      sendReportNotification(orphan_id, report_type || "Updated Report", report_date || new Date());

      res.status(200).json({ message: "Report updated successfully 🛠️ and notification sent ✅" });
    });
  });
};


// 📌 حذف تقرير
exports.deleteReport = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM orphan_reports WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Report deleted successfully 🗑️" });
  });
};