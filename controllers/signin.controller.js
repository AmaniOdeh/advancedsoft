const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "Please provide email and password." });

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length === 0)
      return res.status(401).json({ message: "Invalid email or password." });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword)
      return res.status(401).json({ message: "Invalid email or password." });

    // ✅ Admin
    if (user.role === "admin") {
      db.query("SELECT is_super FROM admins WHERE user_id = ?", [user.id], (err2, adminResults) => {
        if (err2) return res.status(500).json({ error: err2 });

        const is_super = adminResults.length > 0 ? !!adminResults[0].is_super : false;

        const token = jwt.sign(
          {
            id: user.id,
            role: user.role,
            orphanage_id: user.orphanage_id,
            is_super: is_super
          },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        return res.status(200).json({
          message: "Login successful ✅",
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            orphanage_id: user.orphanage_id,
            is_super: is_super
          }
        });
      });

    // ✅ باقي الأدوار
    } else {
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          orphanage_id: user.orphanage_id
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful ✅",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          orphanage_id: user.orphanage_id
        }
      });
    }
  });
};

module.exports = {
  signin,
};
