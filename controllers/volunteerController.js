const db = require("../db");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 🟧 1. إنشاء نشاط جديد من دار الأيتام
exports.postActivity = (req, res) => {
  const { name, description, type_id } = req.body;
  const orphanage_id = req.user.orphanage_id;

  if (!name || !description || !type_id || !orphanage_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sql = `INSERT INTO activities (name, description, orphanage_id, type_id) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, description, orphanage_id, type_id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Activity posted ✅", activity_id: result.insertId });
  });
};

// 🟧 2. جدولة النشاط
exports.scheduleActivity = (req, res) => {
  const { activity_id, scheduled_date, start_time, end_time, location } = req.body;
  if (!activity_id || !scheduled_date || !start_time || !end_time || !location) {
    return res.status(400).json({ error: "Missing schedule data" });
  }

  const sql = `INSERT INTO activity_schedule (activity_id, scheduled_date, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)`;
  db.query(sql, [activity_id, scheduled_date, start_time, end_time, location], (err) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json({ message: "Schedule added ✅" });
  });
};

// 🟩 3. تطابق نوع المتطوع مع النشاطات المجدولة
// 🟩 3. تطابق نوع المتطوع مع النشاطات المجدولة
exports.matchVolunteer = (req, res) => {
  const volunteer_id = req.params.volunteer_id; // ✅ استخدم params بدل req.user

  db.query(`SELECT type_id FROM volunteers WHERE id = ?`, [volunteer_id], (err, result) => {
    if (err || result.length === 0)
      return res.status(404).json({ error: "Volunteer not found" });

    const type_id = result[0].type_id;

    const sql = `
      SELECT 
        a.id AS activity_id,
        a.name AS activity,
        a.description,
        s.id AS schedule_id,
        s.scheduled_date,
        s.start_time,
        s.end_time,
        s.location
      FROM activities a
      JOIN activity_schedule s ON a.id = s.activity_id
      WHERE a.type_id = ?
        AND s.id NOT IN (
          SELECT schedule_id 
          FROM volunteer_requests 
          WHERE volunteer_id = ?
        )
    `;

    db.query(sql, [type_id, volunteer_id], (err2, matches) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ available_activities: matches });
    });
  });
};



// 🟩 4. جلب المتطوعين المشاركين في نشاط معين
exports.getVolunteersForActivity = (req, res) => {
  const { schedule_id } = req.params;
  const sql = `
    SELECT u.name, vt.name AS type, v.id AS volunteer_id 
    FROM volunteer_activities va 
    JOIN volunteers v ON va.volunteer_id = v.id 
    JOIN users u ON v.user_id = u.id 
    JOIN volunteer_types vt ON v.type_id = vt.id 
    WHERE va.schedule_id = ?`;

  db.query(sql, [schedule_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ volunteers: rows });
  });
};

// 🟧 5. تقديم طلب من متطوع للانضمام لنشاط
// ✅ عدلي هاد الجزء فقط
exports.requestToJoinActivity = (req, res) => {
  const { volunteer_id, orphanage_id, schedule_id } = req.body;

  if (!volunteer_id || !orphanage_id || !schedule_id) {
    return res.status(400).json({ error: "Missing request data" });
  }

  const insertSql = `
    INSERT INTO volunteer_requests (volunteer_id, orphanage_id, schedule_id) 
    VALUES (?, ?, ?)
  `;

  db.query(insertSql, [volunteer_id, orphanage_id, schedule_id], (err2) => {
    if (err2) return res.status(500).json({ error: err2 });
    res.status(201).json({ message: "Request submitted ✅" });
  });
};


// 🟩 6. جلب كل الطلبات الواردة لدار الأيتام
exports.getVolunteerRequests = (req, res) => {
  const orphanage_id = req.user.orphanage_id;

  const sql = `
    SELECT r.id, u.name, u.email, vt.name AS type, 
           s.scheduled_date, s.start_time, s.end_time, s.location, r.status 
    FROM volunteer_requests r 
    JOIN volunteers v ON r.volunteer_id = v.id 
    JOIN users u ON v.user_id = u.id 
    JOIN volunteer_types vt ON v.type_id = vt.id 
    JOIN activity_schedule s ON r.schedule_id = s.id 
    WHERE r.orphanage_id = ?`;

  db.query(sql, [orphanage_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ requests: rows });
  });
};

// 🟪 7. الموافقة / الرفض على طلب المتطوع من دار الأيتام
exports.respondToRequest = (req, res) => {
  const { request_id } = req.params;
  const { status } = req.body;

  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  const updateSql = `UPDATE volunteer_requests SET status = ? WHERE id = ?`;
  db.query(updateSql, [status, request_id], (err) => {
    if (err) return res.status(500).json({ error: err });

    // 1. نجلب بيانات المستخدم والنشاط
    const infoSql = `
      SELECT u.email, u.name, s.scheduled_date, s.location 
      FROM volunteer_requests r 
      JOIN volunteers v ON r.volunteer_id = v.id 
      JOIN users u ON v.user_id = u.id 
      JOIN activity_schedule s ON r.schedule_id = s.id 
      WHERE r.id = ?`;

    db.query(infoSql, [request_id], (err2, rows) => {
      if (err2 || rows.length === 0)
        return res.status(500).json({ error: err2 || "Request not found" });

      const { email, name, scheduled_date, location } = rows[0];
      const subject = status === "approved" ? "🎉 Request Approved" : "❌ Request Rejected";
      const html = status === "approved"
        ? `<h3>Dear ${name},</h3><p>Your request to join the activity on ${scheduled_date} at ${location} has been <strong>approved</strong>. 💚</p>`
        : `<h3>Dear ${name},</h3><p>Your request to join the activity on ${scheduled_date} at ${location} has been <strong>rejected</strong>. 💔</p>`;

      transporter.sendMail({ from: process.env.EMAIL_USER, to: email, subject, html }, (emailErr) => {
        if (emailErr) console.error("❌ Email error:", emailErr);
        else console.log(`📧 Email sent to: ${email}`);
      });

      if (status === "approved") {
        const insertSql = `
          INSERT INTO volunteer_activities (volunteer_id, orphanage_id, schedule_id) 
          SELECT volunteer_id, orphanage_id, schedule_id 
          FROM volunteer_requests 
          WHERE id = ?`;

        db.query(insertSql, [request_id], (err3) => {
          if (err3) return res.status(500).json({ error: err3 });
          res.status(200).json({ message: "Request approved ✅ and email sent" });
        });
      } else {
        res.status(200).json({ message: "Request rejected ❌ and email sent" });
      }
    });
  });
};
