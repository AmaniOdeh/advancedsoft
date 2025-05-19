const db = require('../db');

exports.createDeliveryRequest = (req, res) => {
  const { donation_id, volunteer_id, notes } = req.body;

  const sql = `
    INSERT INTO delivery_requests (donation_id, volunteer_id, notes)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [donation_id, volunteer_id, notes], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({
      message: "Delivery request created ✅",
      request_id: result.insertId
    });
  });
};
exports.updateDeliveryRequestStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(`SELECT id FROM delivery_requests WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({ message: "Delivery request not found" });
    }
    const sql = `UPDATE delivery_requests SET status = ? WHERE id = ?`;

    db.query(sql, [status, id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({ message: "Status updated ✅" });
    });
  });
};
exports.updateCurrentLocation = (req, res) => {
  const { id } = req.params;
  const { current_location } = req.body;
  db.query(`SELECT id FROM delivery_requests WHERE id = ?`, [id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    if (rows.length === 0) {
      return res.status(404).json({ message: "Delivery request not found" });
    }
    const sql = `UPDATE delivery_requests SET current_location = ? WHERE id = ?`;
    db.query(sql, [current_location, id], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2.message });

      res.json({ message: "Location updated ✅" });
    });
  });
};
exports.trackDeliveryRequest = (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT dr.id, dr.status, dr.current_location, dr.assigned_at,
           d.type, d.description, d.amount, u.name AS volunteer_name
    FROM delivery_requests dr
    JOIN donations d ON dr.donation_id = d.id
    JOIN users u ON dr.volunteer_id = u.id
    WHERE dr.id = ?
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    if (results.length === 0)
      return res.status(404).json({ message: "Request not found" });

    res.json(results[0]);
  });
};
exports.getDonationTracking = (req, res) => {
  const { id } = req.params;

  db.query(
    `SELECT id, type, status, amount, description, created_at
     FROM donations WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });

      if (results.length === 0)
        return res.status(404).json({ message: 'Donation not found' });

      res.json(results[0]);
    }
  );
};
exports.updateDonationStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  db.query(
    `UPDATE donations SET status = ? WHERE id = ?`,
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });

      if (result.affectedRows === 0)
        return res.status(404).json({ message: 'Donation not found' });

      res.json({ message: 'Donation status updated successfully' });
    }
  );
};
