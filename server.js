// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// -------------------------
// STATIC FILES (images)
// -------------------------
// Anything under public/images is reachable as /images/...
// e.g. public/images/bosses/gundyr.jpg -> http://localhost:3001/images/bosses/gundyr.jpg
app.use("/images", express.static(path.join(__dirname, "public", "images")));

// -------------------------
// LOAD DATA FROM public/data
// -------------------------

// Base boss list (name, label, isDlc, etc.)
const bosses = require(path.join(__dirname, "public", "data", "bosses.json"));

// Extra boss info keyed by boss name/label (imgs + text)
const bossInfo = require(path.join(__dirname, "public", "data", "bossInfo.js"));

// Full character info object keyed by name
const charactersInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "charactersInfo.js"
));

// Full world/location info object keyed by name
const worldInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "worldInfo.js"
));

app.use(cors());
app.use(express.json());

// -------------------------
// ROOT TEST ROUTE
// -------------------------
app.get("/", (req, res) => {
  res.send("Dark Souls III API is running.");
});

// =========================
//        BOSSES API
// =========================

// Helper to merge base boss list with bossInfo imgs + text
const buildBossList = (onlyDlc = null) => {
  return bosses
    .filter((b) => {
      if (onlyDlc === null) return true;      // all
      if (onlyDlc === true) return !!b.isDlc; // only DLC
      return !b.isDlc;                        // only main game
    })
    .map((boss, index) => {
      const lore = bossInfo[boss.label] || bossInfo[boss.name] || {};
      return {
        id: index,
        ...boss,
        imgs: lore.imgs || [],
        text: lore.text || "",
      };
    });
};

// All bosses
app.get("/api/bosses", (req, res) => {
  const combined = buildBossList(null);
  res.json(combined);
});

// Main-game bosses only
app.get("/api/bosses/main", (req, res) => {
  const combined = buildBossList(false);
  res.json(combined);
});

// DLC bosses only
app.get("/api/bosses/dlc", (req, res) => {
  const combined = buildBossList(true);
  res.json(combined);
});

// =========================
//      CHARACTERS API
// =========================

// charactersInfo is an object keyed by name.
// Convert to array so React can map over it.
app.get("/api/characters", (req, res) => {
  try {
    const keys = Object.keys(charactersInfo || {});
    const list = keys.map((name, index) => {
      const info = charactersInfo[name];
      return {
        id: index,
        name,
        ...info, // area, imgs, text
      };
    });

    res.json(list);
  } catch (e) {
    console.error("Error building characters list:", e);
    res.status(500).json({ error: "Failed to build characters list" });
  }
});

// =========================
//        WORLDS API
// =========================

// worldInfo is an object keyed by location name.
app.get("/api/worlds", (req, res) => {
  try {
    const keys = Object.keys(worldInfo || {});
    const list = keys.map((name, index) => {
      const info = worldInfo[name];
      return {
        id: index,
        name,
        ...info, // isDlc, imgs, text
      };
    });

    res.json(list);
  } catch (e) {
    console.error("Error building worlds list:", e);
    res.status(500).json({ error: "Failed to build worlds list" });
  }
});

// -------------------------
// START SERVER
// -------------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
