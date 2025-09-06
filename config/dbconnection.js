

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://meenaloshinisivakumar_db_user:test123@testdb.vhjjjul.mongodb.net/?retryWrites=true&w=majority&appName=testdb");
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("DB connection failed ❌", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
