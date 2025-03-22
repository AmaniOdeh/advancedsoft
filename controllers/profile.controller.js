const db = require("../db");

// عرض بيانات المستخدم
exports.getProfile = (req, res) => {
  const { id, role } = req.user;

  db.query("SELECT * FROM users WHERE id = ?", [id], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0) return res.status(404).json({ message: "User not found." });

    const user = userResults[0];
    let table = "";

    switch (role) {
      case "donor":
        table = "donors";
        break;
      case "sponsor":
        table = "sponsors";
        break;
      case "volunteer":
        table = "volunteers";
        break;
      case "orphan":
        table = "orphans";
        break;
      case "admin":
        table = "admins";
        break;
      default:
        return res.status(200).json({ user });
    }

    db.query(`SELECT * FROM ${table} WHERE user_id = ?`, [id], (err2, roleData) => {
      if (err2) return res.status(500).json({ error: err2 });

      return res.status(200).json({
        user,
        role_data: roleData[0] || null
      });
    });
  });
};

// تعديل بيانات المستخدم (من جدول users فقط)
exports.updateProfile = (req, res) => {
    const { id } = req.user;
    const fields = req.body;
  
    if (Object.keys(fields).length === 0) {
      return res.status(400).json({ message: "No fields provided to update." });
    }
  
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setClause = keys.map(key => `${key} = ?`).join(", ");
  
    db.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      [...values, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });
        return res.status(200).json({ message: "Profile updated successfully ✅" });
      }
    );
  };
  

// حذف المستخدم من users والجدول الفرعي
exports.deleteProfile = (req, res) => {
  const { id, role } = req.user;

  let table = "";
  switch (role) {
    case "donor":
      table = "donors";
      break;
    case "sponsor":
      table = "sponsors";
      break;
    case "volunteer":
      table = "volunteers";
      break;
    case "orphan":
      table = "orphans";
      break;
    case "admin":
      table = "admins";
      break;
    default:
      table = "";
  }

  // حذف من الجدول الفرعي أولاً
  if (table) {
    db.query(`DELETE FROM ${table} WHERE user_id = ?`, [id], (err) => {
      if (err) return res.status(500).json({ error: err });

      // ثم نحذف من جدول users
      db.query("DELETE FROM users WHERE id = ?", [id], (err2) => {
        if (err2) return res.status(500).json({ error: err2 });

        return res.status(200).json({ message: "User deleted successfully ✅" });
      });
    });
  } else {
    // فقط من users لو ما في جدول فرعي
    db.query("DELETE FROM users WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json({ error: err });
      return res.status(200).json({ message: "User deleted successfully ✅" });
    });
  }
};
