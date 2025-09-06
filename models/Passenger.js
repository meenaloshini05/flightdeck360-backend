const mongoose = require("mongoose");

const passengerSchema = new mongoose.Schema({
  name: String,
  contactNumber: String,
  email: String,
  numberOfTravellers: Number,
  assistanceRequired: Boolean
});

module.exports = mongoose.model("Passenger", passengerSchema);
