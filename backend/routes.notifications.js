const express = require('express');
// For now we return an empty list. In future this can be backed by a Notifications model.
const router = express.Router();

// GET /api/notifications?userId=... -> return notifications for the user (empty for now)
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;
    // TODO: replace with real DB lookup when Notification model is added
    const notifications = [];
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Mark a notification as read (placeholder implementation)
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    // TODO: implement DB update when Notification model exists
    // For now, just return success so the frontend can behave as if it worked
    res.json({ message: 'Notification marked read', id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
