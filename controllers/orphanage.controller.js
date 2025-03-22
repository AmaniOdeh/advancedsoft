const db = require("../db");

// إنشاء دار أيتام جديدة
exports.createOrphanage = (req, res) => {
  const { name, address, contact_phone } = req.body;

  if (!name || !address || !contact_phone) {
    return res.status(400).json({ message: "جميع الحقول مطلوبة" });
  }

  db.query(
    "INSERT INTO orphanages (name, address, contact_phone) VALUES (?, ?, ?)",
    [name, address, contact_phone],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });

      res.status(201).json({
        message: "✅ تم إنشاء دار الأيتام بنجاح",
        orphanageId: result.insertId,
      });
    }
  );
};
