const db = require("../config/database");

const getUserByEmail = async (email) => {
  try {
    console.log("Searching for email:", email);

    const sql = "SELECT * FROM users WHERE email = ?";
    console.log("SQL Query:", sql);

    const [rows] = await db.query(sql, [email]);
    console.log("Database result:", rows);

    return rows[0];
  } catch (error) {
    console.error("Error in getUserByEmail:", error);
    throw error;
  }
};

const createUser = async (user) => {
  const { name, email, password, role } = user;
  try {
    const [result] = await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role]
    );
    return result.insertId;
  } catch (error) {
    console.error("Lỗi khi tạo user:", error);
    throw error;
  }
};

module.exports = { getUserByEmail, createUser };