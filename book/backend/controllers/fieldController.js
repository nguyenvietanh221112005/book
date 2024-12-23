const fieldModel = require("../models/fieldModel");

const getFields = async (req, res) => {
  try {
    const fields = await fieldModel.getAllFields();
    res.status(200).json(fields);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getFields };
