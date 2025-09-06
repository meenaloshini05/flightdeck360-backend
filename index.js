const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const connectDB = require("./config/dbconnection");
const { auth, SECRET } = require("./middleware/auth");

const User = require("./models/User");
const Flight = require("./models/Flight");
const Booking = require("./models/Booking");


const app = express();
app.use(cors());
app.use(express.json());

// connect db
connectDB();

// ========== AUTH ROUTES ==========
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    res.json({ msg: "User registered" });
  } catch (err) {
    res.status(400).json({ msg: "Error registering user", err });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ msg: "Invalid password" });

  const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
  res.json({ token, role: user.role });
});

// ========== ADMIN ROUTES ==========
app.post("/flights", auth("admin"), async (req, res) => {
  const flight = new Flight(req.body);
  await flight.save();
  res.json(flight);
});

app.get("/flights", async (req, res) => {
  const flights = await Flight.find();
  res.json(flights);
});

app.put("/flights/:id", auth("admin"), async (req, res) => {
  const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(flight);
});

app.delete("/flights/:id", auth("admin"), async (req, res) => {
  await Flight.findByIdAndDelete(req.params.id);
  res.json({ msg: "Flight deleted" });
});

// ========== PASSENGER BOOKING ==========
app.post("/bookings", auth("passenger"), async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const booking = new Booking({
      passengerName: req.body.passengerName,
      contact: req.body.contact,
      email: user.email,   // ✅ auto bind user email
      flightNumber: req.body.flightNumber,
      flightName:req.body.flightName,
      from: req.body.from,
      to: req.body.to,
      journeyDate: req.body.journeyDate,
      totalPassengers: req.body.totalPassengers,
    });

    await booking.save();
    res.json({ msg: "Booking created", booking });
  } catch (err) {
    res.status(400).json({ msg: "Booking failed", err });
  }
});



app.get("/bookings", auth("admin"), async (req, res) => {
  const bookings = await Booking.find();
  res.json(bookings);
});

// Get a single flight by ID
app.get("/flights/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ msg: "Flight not found" });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching flight", err });
  }
});


app.put("/bookings/:id", auth("admin"), async (req, res) => {
  const booking = await Booking.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(booking);
});



app.get("/mybookings", auth("passenger"), async (req, res) => {
  const user = await User.findById(req.user.id);
  const bookings = await Booking.find({ email: user.email });
  res.json(bookings);
});

// start server
app.listen(5001, () => console.log("Server running on http://localhost:5001"));
