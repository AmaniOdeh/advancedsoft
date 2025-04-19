const db = require('../db');

exports.getDonationTracking = (req, res) => {
  const { id } = req.params;
  console.log("🚀 Tracking donation ID:", id); // <== أضف هاي

  db.query(
    `SELECT id, type, status, amount, description, created_at
     FROM donations WHERE id = ?`,
    [id],
    (err, results) => {
      if (err) {
        console.error("❌ Query error:", err); // <== وهاي
        return res.status(500).json({ error: err.message });

      }

      if (results.length === 0) {
        console.warn("⚠️ No donation found with ID", id); // <== وهاي

        return res.status(404).json({ message: 'Donation not found' });
      }
      console.log("✅ Found donation:", results[0]); // <== وهاي كمان

      res.json(results[0]);
    }
  );
};
exports.updateDeliveryStatus = (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
  
    db.query(
      `UPDATE donations SET status = ? WHERE id = ?`,
      [status, id],
      (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
  
        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Donation not found' });
        }
  
        res.json({ message: 'Donation status updated successfully' });
      }
    );
  };
  