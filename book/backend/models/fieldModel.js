const db = require("../config/database");

const getAllFields = async () => {
  const [rows] = await db.query("SELECT * FROM fields");
  return rows;
};

module.exports = { getAllFields };
