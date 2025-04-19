const db = require('../db');

exports.addPartner = (req, res) => {
  const { name, description, contact_email, website } = req.body;

  const sql = `INSERT INTO partners (name, description, contact_email, website) VALUES (?, ?, ?, ?)`;
  db.query(sql, [name, description, contact_email, website], (err, result) => {
    if (err) return res.status(500).json({ error: err });

    res.status(201).json({ message: 'Partner added successfully' });
  });
};

exports.getAllPartners = (req, res) => {
  db.query(`SELECT * FROM partners`, (err, rows) => {
    if (err) return res.status(500).json({ error: err });

    res.json(rows);
  });
};
