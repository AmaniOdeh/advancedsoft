const db = require("../db");
const { generateReportPDF } = require("../utils/pdfGenerator");
const sgMail = require("@sendgrid/mail");
const path = require("path");
const fs = require("fs");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// 📄 إنشاء تقرير جديد
exports.createReport = async (req, res) => {
  try {
    const { orphan_id, report_type, description } = req.body;
    const orphanage_id = req.user.orphanage_id;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const pdfPath = await generateReportPDF({ orphan_id, report_type, description, photoUrl });

    const sql = `
      INSERT INTO orphan_reports (orphan_id, report_type, description, photo_url, report_date)
      VALUES (?, ?, ?, ?, NOW())
    `;

    db.query(sql, [orphan_id, report_type, description, pdfPath], (err, result) => {
      if (err) return res.status(500).json({ error: err });

      // 📨 إرسال التقرير عبر الإيميل لكل متبرع فقط للتبرعات approved
      const donorEmailSql = `
      SELECT DISTINCT u.email, u.name AS donor_name, o.id AS orphan_id, ou.name AS orphan_name
      FROM donations dn
      JOIN donors d ON dn.donor_id = d.id
      JOIN users u ON d.user_id = u.id
      JOIN orphans o ON dn.orphan_id = o.id
      JOIN users ou ON o.user_id = ou.id
      WHERE dn.orphan_id = ?
    `;
    

      db.query(donorEmailSql, [orphan_id], async (err3, donors) => {
        if (err3) {
          console.error("❌ Error fetching donor emails:", err3);
        } else if (donors.length > 0) {
          const pdfContent = fs.readFileSync(path.join("public", pdfPath)).toString("base64");

          for (const donor of donors) {
            const msg = {
              to: donor.email,
              from: {
                name: "HopeConnect Team",
                email: process.env.EMAIL_USER,
              },
              subject: `📢 New Update for ${donor.orphan_name}`,
              html: `
                <h3>Dear ${donor.donor_name},</h3>
                <p>We wanted to inform you that a new <strong>${report_type}</strong> report has been added for orphan <strong>${donor.orphan_name}</strong>.</p>
                <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p>Thank you for your continued support 💚</p>
                <p>— HopeConnect Team</p>
              `,
              attachments: [
                {
                  content: pdfContent,
                  filename: path.basename(pdfPath),
                  type: "application/pdf",
                  disposition: "attachment",
                },
              ],
            };

            try {
              await sgMail.send(msg);
              console.log(`✅ Email sent to ${donor.email}`);
            } catch (sendErr) {
              console.error(`❌ Failed to send email to ${donor.email}:`, sendErr);
            }
          }
        }
      });

      res.status(201).json({
        message: "Report added ✅",
        reportId: result.insertId,
        pdf_url: `/reports/${path.basename(pdfPath)}`,
      });
    });
  } catch (err) {
    console.error("❌ Report error:", err);
    res.status(500).json({ error: "Failed to create report" });
  }
};

//  تعديل تقرير
exports.updateReport = (req, res) => {
  const { id } = req.params;
  const { report_type, description } = req.body;

  const sql = `UPDATE orphan_reports SET report_type = ?, description = ? WHERE id = ?`;
  db.query(sql, [report_type, description, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.status(200).json({ message: "Report updated ✏️" });
  });
};

exports.deleteReport = (req, res) => {
  const { id } = req.params;
  const orphanage_id = req.user.orphanage_id;

  // تحقق من ملكية التقرير
  const checkSql = `
    SELECT r.id
    FROM orphan_reports r
    JOIN orphans o ON r.orphan_id = o.id
    WHERE r.id = ? AND o.orphanage_id = ?
  `;

  db.query(checkSql, [id, orphanage_id], (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    if (rows.length === 0)
      return res.status(403).json({ message: "Access denied ❌" });

    // حذف التقرير
    const deleteSql = `DELETE FROM orphan_reports WHERE id = ?`;
    db.query(deleteSql, [id], (err2) => {
      if (err2) return res.status(500).json({ error: err2 });
      res.status(200).json({ message: "Report deleted 🗑️" });
    });
  });
};
