const db = require('../db');


const addReview = (req, res) => {
  const user_id = req.user.id;
  const orphanage_id = req.params.id;
  const { rating, comment } = req.body;

  db.query("SELECT * FROM donors WHERE user_id = ?", [user_id], (err, donorResult) => {
    if (err || donorResult.length === 0) {
      return res.status(403).json({ error: "Only donors are allowed to add reviews." });
    }

    const donor_id = donorResult[0].id;

    db.query(
      "INSERT INTO orphanage_reviews (donor_id, orphanage_id, rating, comment) VALUES (?, ?, ?, ?)",
      [donor_id, orphanage_id, rating, comment],
      (err) => {
        if (err) return res.status(500).json({ error: "Failed to add review." });
        res.status(201).json({ message: "Review added successfully." });
      }
    );
  });
};


const getReviews = (req, res) => {
  const orphanage_id = req.params.id;

  db.query(
    `SELECT r.*, u.name AS donor_name, o.name AS orphanage_name
     FROM orphanage_reviews r
     JOIN donors d ON r.donor_id = d.id
     JOIN users u ON d.user_id = u.id
     JOIN orphanages o ON r.orphanage_id = o.id
     WHERE r.orphanage_id = ?`,
    [orphanage_id],
    (err, results) => {
      if (err) return res.status(500).json({ error: "Failed to fetch reviews." });
      res.status(200).json(results);
    }
  );
};

module.exports = {
  addReview,
  getReviews
};
