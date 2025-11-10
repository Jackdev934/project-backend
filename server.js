const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// TEMP data (replace with your Dark Souls data later)
const bosses = [
  { id: 1, name: "Iudex Gundyr", location: "Cemetery of Ash" },
  { id: 2, name: "Vordt of the Boreal Valley", location: "High Wall of Lothric" },
];

// Simple API route your React app will call
app.get("/api/bosses", (req, res) => {
  res.json(bosses);
});

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
