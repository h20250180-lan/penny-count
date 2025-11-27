const express = require('express');
const Settings = require('./models.Settings');

const router = express.Router();

// Get settings
router.get('/', async (req, res) => {
  try {
    const settings = await Settings.findOne();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) settings = new Settings(req.body);
    else Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
