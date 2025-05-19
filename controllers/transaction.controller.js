const db = require('../db');
exports.processTransaction = (req, res) => {
  const { donationId } = req.params;
  db.query(`SELECT amount FROM donations WHERE id = ?`, [donationId], (err, donationRows) => {
    if (err) return res.status(500).json({ error: err });
    if (donationRows.length === 0) return res.status(404).json({ message: 'Donation not found' });

    const amount = donationRows[0].amount || 0;
    const fee = parseFloat((amount * 0.05).toFixed(2));
    const net_amount = amount - fee;

    const insertSql = `INSERT INTO transactions (donation_id, amount, fee, net_amount) VALUES (?, ?, ?, ?)`;
    db.query(insertSql, [donationId, amount, fee, net_amount], (err2, result) => {
      if (err2) return res.status(500).json({ error: err2 });

      res.status(201).json({
        id: result.insertId,
        fee,
        net_amount
      });
    });
  });
};
exports.getAllTransactions = (req, res) => {
  db.query(`SELECT * FROM transactions`, (err, rows) => {
    if (err) return res.status(500).json({ error: err });
    res.json(rows);
  });
};
