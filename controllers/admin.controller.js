const db = require('../db');


const verifyOrphanage = (req, res) => {
  const orphanageId = parseInt(req.params.id);
  const { is_verified } = req.body;

  db.query(
    'UPDATE orphanages SET is_verified = ? WHERE id = ?',
    [is_verified, orphanageId],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (result.affectedRows === 0) return res.status(404).json({ message: 'Orphanage not found' });
      res.json({ message: `Orphanage ${is_verified ? 'verified' : 'unverified'} successfully.` });
    }
  );
};


const getOrphanages = (req, res) => {
  const onlyVerified = req.query.verified === 'true';
  const query = onlyVerified
    ? 'SELECT * FROM orphanages WHERE is_verified = 1'
    : 'SELECT * FROM orphanages';

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to fetch orphanages' });
    res.json(results);
  });
};

module.exports = {
  verifyOrphanage,
  getOrphanages
};
