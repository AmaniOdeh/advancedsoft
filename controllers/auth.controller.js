const db = require("../db");
const bcrypt = require("bcryptjs");

// User Signup
const signup = async (req, res) => {
  const {
    name,
    email,
    password,
    phone_number,
    role,
    orphanage_id,
    type_id,               // for volunteers
    age,                   // for orphans
    education_status,
    health_condition,
    room_id,
    address,               // for orphanage
    contact_phone,         // for orphanage
    image_url              // for orphanage (optional)
  } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: "Please provide all required fields." });
  }

  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: err });

    if (results.length > 0) {
      return res.status(409).json({ message: "This email is already in use." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const orphanage = orphanage_id || null;

    db.query(
      "INSERT INTO users (name, email, password, phone_number, role, orphanage_id) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, phone_number, role, orphanage],
      (err, result) => {
        if (err) return res.status(500).json({ error: err });

        const userId = result.insertId;

        switch (role) {
          case "orphanage":
            if (!address || !contact_phone) {
              return res.status(400).json({ message: "Orphanage address and contact phone are required." });
            }

            const image = image_url || "https://via.placeholder.com/150";

            db.query(
              "INSERT INTO orphanages (name, address, contact_phone, image_url, is_verified, email, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
              [name, address, contact_phone, image, false, email, userId],
              (err2) => {
                if (err2) return res.status(500).json({ message: "Failed to register orphanage.", error: err2 });
                return res.status(201).json({ message: "Orphanage registered successfully ✅", userId });
              }
            );
            break;

          case "donor":
            db.query("INSERT INTO donors (user_id) VALUES (?)", [userId], (err2) => {
              if (err2) return res.status(500).json({ error: err2 });
              return res.status(201).json({ message: "Donor registered successfully ✅", userId });
            });
            break;

          case "sponsor":
            db.query("INSERT INTO sponsors (user_id) VALUES (?)", [userId], (err2) => {
              if (err2) return res.status(500).json({ error: err2 });
              return res.status(201).json({ message: "Sponsor registered successfully ✅", userId });
            });
            break;

          case "volunteer":
            if (!type_id) {
              return res.status(400).json({ message: "Volunteer type_id is required." });
            }
            db.query("INSERT INTO volunteers (user_id, type_id) VALUES (?, ?)", [userId, type_id], (err2) => {
              if (err2) return res.status(500).json({ message: "Failed to register volunteer.", error: err2 });
              return res.status(201).json({ message: "Volunteer registered successfully ✅", userId, type_id });
            });
            break;

          case "orphan":
            if (!age || !education_status || !health_condition || !room_id || !orphanage_id) {
              return res.status(400).json({ message: "Orphan details are required." });
            }
            db.query(
              "INSERT INTO orphans (user_id, age, education_status, health_condition, room_id, orphanage_id) VALUES (?, ?, ?, ?, ?, ?)",
              [userId, age, education_status, health_condition, room_id, orphanage_id],
              (err2) => {
                if (err2) return res.status(500).json({ message: "Failed to register orphan.", error: err2 });
                return res.status(201).json({ message: "Orphan registered successfully ✅", userId });
              }
            );
            break;

          case "admin":
            db.query("INSERT INTO admins (user_id, is_super) VALUES (?, ?)", [userId, true], (err2) => {
              if (err2) return res.status(500).json({ message: "Failed to register admin", error: err2 });
              return res.status(201).json({ message: "Admin registered successfully ✅", userId, is_super: true });
            });
            break;

          default:
            return res.status(201).json({
              message: "User registered successfully ✅ (no additional table for this role)",
              userId
            });
        }
      }
    );
  });
};

module.exports = {
  signup,
};
