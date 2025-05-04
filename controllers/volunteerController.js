const db = require("../db");

// ✅ orphanage ينشر نشاط
exports.postActivity = (req, res) => {
  const { name, description, orphanage_id, type_id } = req.body;
  if (!name || !description || !orphanage_id || !type_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `INSERT INTO activities (name, description, orphanage_id, type_id) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, description, orphanage_id, type_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Activity posted ✅", activity_id: result.insertId });
  });
};

// ✅ orphanage يحدد موعد نشاط
exports.scheduleActivity = (req, res) => {
  const { activity_id, scheduled_date, start_time, end_time, location } = req.body;
  if (!activity_id || !scheduled_date || !start_time || !end_time || !location) {
    return res.status(400).json({ error: "Missing schedule data" });
  }

  const sql = `
    INSERT INTO activity_schedule (activity_id, scheduled_date, start_time, end_time, location)
    VALUES (?, ?, ?, ?, ?)
  `;
  db.query(sql, [activity_id, scheduled_date, start_time, end_time, location], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Schedule added ✅" });
  });
};

// ✅ تطابق متطوع مع نشاط حسب النوع
exports.matchVolunteer = (req, res) => {
  const { volunteer_id } = req.params;

  const getTypeSql = `SELECT type_id FROM volunteers WHERE id = ?`;
  db.query(getTypeSql, [volunteer_id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: "Volunteer not found" });

    const type_id = result[0].type_id;

    const matchSql = `
      SELECT a.name AS activity, a.description, s.scheduled_date, s.start_time, s.end_time, s.location
      FROM activities a
      JOIN activity_schedule s ON a.id = s.activity_id
      WHERE a.type_id = ?
    `;

    db.query(matchSql, [type_id], (err2, matches) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ matches });
    });
  });
};

// ✅ تسجيل مشاركة المتطوع في نشاط معين
exports.participateInActivity = (req, res) => {
  const { volunteer_id, orphanage_id, schedule_id } = req.body;
  if (!volunteer_id || !orphanage_id || !schedule_id) {
    return res.status(400).json({ error: "Missing participation data" });
  }

  const sql = `INSERT INTO volunteer_activities (volunteer_id, orphanage_id, schedule_id) VALUES (?, ?, ?)`;
  db.query(sql, [volunteer_id, orphanage_id, schedule_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Volunteer joined activity ✅" });
  });
};

// ✅ orphanage يعرض المتطوعين المشاركين في نشاط محدد
exports.getVolunteersForActivity = (req, res) => {
  const { schedule_id } = req.params;

  const sql = `
    SELECT u.name, vt.name AS type, v.id AS volunteer_id
    FROM volunteer_activities va
    JOIN volunteers v ON va.volunteer_id = v.id
    JOIN users u ON v.user_id = u.id
    JOIN volunteer_types vt ON v.type_id = vt.id
    WHERE va.schedule_id = ?
  `;
  db.query(sql, [schedule_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ volunteers: rows });
  });
};
