const db = require("../db");

exports.getProfile = (req, res) => {
  const { id, role } = req.user;

  db.query("SELECT * FROM users WHERE id = ?", [id], (err, userResults) => {
    if (err) return res.status(500).json({ error: err });
    if (userResults.length === 0) return res.status(404).json({ message: "User not found." });

    const user = userResults[0];

    // Now get data from the role-specific table
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
