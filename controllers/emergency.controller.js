const db = require('../db');
const { sendEmergencyEmail } = require('../utils/emergencyMailer');


const createEmergency = (req, res) => {
  const { title, description, target_amount } = req.body;






  

  const orphanageId = req.user.role === 'orphanage' ? req.user.orphanage_id : null;

  if (!title || !description || !target_amount) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const insertQuery = `
    INSERT INTO emergency_campaigns (title, description, target_amount, collected_amount, status, orphanage_id)
    VALUES (?, ?, ?, 0, 'active', ?)
  `;

  db.query(insertQuery, [title, description, target_amount, orphanageId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to create campaign.', error: err });

    const campaignId = result.insertId;

  
    db.query(`SELECT u.name, u.email FROM users u JOIN donors d ON d.user_id = u.id`, (err2, donors) => {
      if (err2) console.error("Failed to fetch donors:", err2);

      donors.forEach((donor) => {
        sendEmergencyEmail(donor.email, donor.name, title)
          .then(() => console.log(`✅ Email sent to ${donor.email}`))
          .catch((emailErr) => console.error(`❌ Email error to ${donor.email}:`, emailErr));
      });

      res.status(201).json({
        message: "Emergency campaign created & notifications sent ✅",
        campaign_id: campaignId
      });
    });
  });
};


const getAllEmergencies = (req, res) => {
  const query = `
    SELECT ec.*, o.name AS orphanage_name, o.address AS orphanage_address
    FROM emergency_campaigns ec
    LEFT JOIN orphanages o ON ec.orphanage_id = o.id
    ORDER BY ec.created_at DESC
  `;

  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err });
    res.json(results);
  });
};


const donateToEmergency = (req, res) => {
  const campaignId = req.params.id;
  const userId = req.user.id;
  const { amount } = req.body;

  if (!amount) return res.status(400).json({ message: 'Donation amount is required' });

  const insertQuery = 'INSERT INTO emergency_donations (user_id, campaign_id, amount) VALUES (?, ?, ?)';
  db.query(insertQuery, [userId, campaignId, amount], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to donate', error: err });

    const updateQuery = 'UPDATE emergency_campaigns SET collected_amount = collected_amount + ? WHERE id = ?';
    db.query(updateQuery, [amount, campaignId], (err2) => {
      if (err2) return res.status(500).json({ message: 'Donation added but failed to update total', error: err2 });

      const finalQuery = `
        SELECT u.name AS donor_name, u.email, d.amount, c.collected_amount
        FROM emergency_donations d
        JOIN users u ON d.user_id = u.id
        JOIN emergency_campaigns c ON d.campaign_id = c.id
        WHERE d.user_id = ? AND d.campaign_id = ?
        ORDER BY d.id DESC
        LIMIT 1
      `;
      db.query(finalQuery, [userId, campaignId], (err3, result) => {
        if (err3) return res.status(500).json({ message: 'Donation recorded, but failed to fetch details', error: err3 });

        const data = result[0];
        res.status(201).json({
          message: 'Donation successful ✅',
          donor: {
            name: data.donor_name,
            email: data.email,
            donated_amount: data.amount,
            total_collected: data.collected_amount
          }
        });
      });
    });
  });
};

module.exports = {
  createEmergency,
  getAllEmergencies,
  donateToEmergency
};
