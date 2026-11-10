const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

// MongoDB connection string
const MONGO_URI =
  "mongodb+srv://pud45_db_user:Pmq9cD9ixxBANZZG@group404.vuoab1u.mongodb.net/?appName=group404";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const panelSchema = new mongoose.Schema({
  id: String,
  speaker: String,
  title: String,
  category: String,
  room: String,
  duration: Number,
  capacity: Number,
  description: String,
  status: { type: String, default: "pending" },
  moderatorComment: String,
  submittedAt: { type: Date, default: Date.now },
});

const Panel = mongoose.model("Panel", panelSchema);

// Helper to generate next panel ID
async function getNextId() {
  const lastPanel = await Panel.findOne().sort({ submittedAt: -1 });
  const lastIdNum =
    lastPanel && lastPanel.id ? parseInt(lastPanel.id.replace("DC", "")) : 0;
  return `DC${String(lastIdNum + 1).padStart(3, "0")}`;
}

const attendeeSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  age: { type: Number, required: true },
  affiliation: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now },
});

const Attendee = mongoose.model("Attendee", attendeeSchema);

const orderSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
  cart: [
    {
      id: String,
      name: String,
      price: Number,
      size: String,
      quantity: Number,
    },
  ],
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", orderSchema);

// GET all panels
app.get("/api/panels", async (req, res) => {
  try {
    const panels = await Panel.find();
    res.json(panels);
    console.log("Fetched all panels.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch panels" });
  }
});

// POST new panel
app.post("/api/panels", async (req, res) => {
  try {
    const { speaker, title, category, room, duration, capacity, description } =
      req.body;

    if (!speaker || !title || !category || !room || !duration) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newId = await getNextId();

    const newPanel = new Panel({
      id: newId,
      speaker: speaker.trim(),
      title: title.trim(),
      category: category.trim(),
      room: room.trim(),
      duration: Number(duration),
      capacity: Number(capacity),
      description: (description || "").trim(),
    });

    await newPanel.save();
    console.log(
      `New panel created: ID = ${newPanel.id}, Title = ${newPanel.title}`,
    );
    res.status(201).json(newPanel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save panel." });
  }
});

// PUT update panel
app.put("/api/panels/:id", async (req, res) => {
  try {
    const { status, moderatorComment } = req.body;
    const panel = await Panel.findOne({ id: req.params.id });

    if (!panel) return res.status(404).json({ error: "Panel not found." });

    if (status) panel.status = status;
    if (moderatorComment !== undefined)
      panel.moderatorComment = moderatorComment;

    await panel.save();
    console.log(`Panel updated: ID = ${panel.id}, Status = ${panel.status}`);
    res.json(panel);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update panel." });
  }
});

// DELETE a panel
app.delete("/api/panels/:id", async (req, res) => {
  try {
    const result = await Panel.deleteOne({ id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Panel not found." });
    }
    console.log(`Panel deleted: ID = ${req.params.id}`);
    res.json({ message: "Panel deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete panel." });
  }
});

// GET all attendees
app.get("/api/attendees", async (req, res) => {
  try {
    const attendees = await Attendee.find();
    res.json(attendees);
    console.log("Fetched all attendees.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch attendees" });
  }
});

// POST new attendee
app.post("/api/attendees", async (req, res) => {
  try {
    const { fullName, email, phone, age, affiliation } = req.body;

    if (!fullName || !email || !age || !affiliation) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const newAttendee = new Attendee({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      age: Number(age),
      affiliation: affiliation.trim(),
    });

    await newAttendee.save();
    console.log(
      `New attendee added: Name = ${newAttendee.fullName}, Email = ${newAttendee.email}`,
    );
    res.status(201).json(newAttendee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save attendee." });
  }
});

// PUT update attendee
app.put("/api/attendees/:id", async (req, res) => {
  try {
    const { fullName, email, phone, age, affiliation } = req.body;
    const attendee = await Attendee.findById(req.params.id);

    if (!attendee)
      return res.status(404).json({ error: "Attendee not found." });

    if (fullName) attendee.fullName = fullName.trim();
    if (email) attendee.email = email.trim();
    if (phone !== undefined) attendee.phone = phone.trim();
    if (age) attendee.age = Number(age);
    if (affiliation) attendee.affiliation = affiliation.trim();

    await attendee.save();
    console.log(
      `Attendee updated: ID = ${attendee._id}, Name = ${attendee.fullName}`,
    );
    res.json(attendee);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update attendee." });
  }
});

// DELETE an attendee
app.delete("/api/attendees/:id", async (req, res) => {
  try {
    const result = await Attendee.deleteOne({ _id: req.params.id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Attendee not found." });
    }
    console.log(`Attendee deleted: ID = ${req.params.id}`);
    res.json({ message: "Attendee deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete attendee." });
  }
});

// POST new order
app.post("/api/orders", async (req, res) => {
  try {
    const { name, email, address, cart, total } = req.body;

    if (!name || !email || !address || !cart || cart.length === 0) {
      return res.status(400).json({ error: "Invalid order data" });
    }

    const newOrder = new Order({
      name: name.trim(),
      email: email.trim(),
      address: address.trim(),
      cart,
      total: Number(total),
    });

    await newOrder.save();
    console.log(
      `Order placed successfully: Order ID = ${newOrder._id}, Total = ${newOrder.total}`,
    );

    res.status(201).json({
      message: "Order placed successfully",
      orderId: newOrder._id,
    });
  } catch (err) {
    console.error(`Failed to save order: ${err.message}`);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// GET all orders
app.get("/api/orders", async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
    console.log("Fetched all orders.");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
