const db = require("../db");

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

exports.scheduleActivity = (req, res) => {
  const { activity_id, scheduled_date, start_time, end_time, location } = req.body;
  if (!activity_id || !scheduled_date || !start_time || !end_time || !location) {
    return res.status(400).json({ error: "Missing schedule data" });
  }
  const sql = `INSERT INTO activity_schedule (activity_id, scheduled_date, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [activity_id, scheduled_date, start_time, end_time, location], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Schedule added ✅" });
  });
};

exports.matchVolunteer = (req, res) => {
  const { volunteer_id } = req.params;
  db.query(`SELECT type_id FROM volunteers WHERE id = ?`, [volunteer_id], (err, result) => {
    if (err || result.length === 0) return res.status(404).json({ error: "Volunteer not found" });
    const type_id = result[0].type_id;
    const sql = `SELECT a.name AS activity, a.description, s.scheduled_date, s.start_time, s.end_time, s.location FROM activities a JOIN activity_schedule s ON a.id = s.activity_id WHERE a.type_id = ?`;
    db.query(sql, [type_id], (err2, matches) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ matches });
    });
  });
};

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

exports.getVolunteersForActivity = (req, res) => {
  const { schedule_id } = req.params;
  const sql = `SELECT u.name, vt.name AS type, v.id AS volunteer_id FROM volunteer_activities va JOIN volunteers v ON va.volunteer_id = v.id JOIN users u ON v.user_id = u.id JOIN volunteer_types vt ON v.type_id = vt.id WHERE va.schedule_id = ?`;
  db.query(sql, [schedule_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ volunteers: rows });
  });
};

exports.requestToJoinActivity = (req, res) => {
  const { volunteer_id, orphanage_id, schedule_id } = req.body;
  if (!volunteer_id || !orphanage_id || !schedule_id) {
    return res.status(400).json({ error: "Missing request data" });
  }
  const sql = `INSERT INTO volunteer_requests (volunteer_id, orphanage_id, schedule_id) VALUES (?, ?, ?)`;
  db.query(sql, [volunteer_id, orphanage_id, schedule_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Request submitted ✅" });
  });
};

exports.getVolunteerRequests = (req, res) => {
  const { orphanage_id } = req.params;
  const sql = `SELECT r.id, u.name, vt.name AS type, s.scheduled_date, s.start_time, s.end_time, s.location, r.status FROM volunteer_requests r JOIN volunteers v ON r.volunteer_id = v.id JOIN users u ON v.user_id = u.id JOIN volunteer_types vt ON v.type_id = vt.id JOIN activity_schedule s ON r.schedule_id = s.id WHERE r.orphanage_id = ?`;
  db.query(sql, [orphanage_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ requests: rows });
  });
};

exports.respondToRequest = (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }
  db.query(`UPDATE volunteer_requests SET status = ? WHERE id = ?`, [status, request_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    if (status === 'approved') {
      db.query(`SELECT volunteer_id, orphanage_id, schedule_id FROM volunteer_requests WHERE id = ?`, [request_id], (err2, rows) => {
        if (err2 || rows.length === 0) return res.status(500).json({ error: err2 || "Request not found" });
        const { volunteer_id, orphanage_id, schedule_id } = rows[0];
        db.query(`INSERT INTO volunteer_activities (volunteer_id, orphanage_id, schedule_id) VALUES (?, ?, ?)`, [volunteer_id, orphanage_id, schedule_id], (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          res.status(200).json({ message: "Request approved and volunteer added ✅" });
        });
      });
    } else {
      res.status(200).json({ message: "Request rejected ❌" });
    }
  });
};
