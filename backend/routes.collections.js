const express = require('express');
const Collection = require('./models.Collection');

const router = express.Router();

// Create collection
router.post('/', async (req, res) => {
  try {
    const collection = new Collection(req.body);
    await collection.save();
    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all collections
router.get('/', async (req, res) => {
  try {
    const collections = await Collection.find();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ...add more collection routes as needed

module.exports = router;
