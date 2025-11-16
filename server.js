// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();
const PORT = process.env.PORT || 3001;

// Static images
app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use(cors());
app.use(express.json());

// ===== DATA REQUIRES =====

// Bosses
const bosses = require(path.join(__dirname, "public", "data", "bosses.json"));
const bossInfo = require(path.join(__dirname, "public", "data", "bossInfo.js"));

// Characters
const charactersInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "charactersInfo.js"
));

// Worlds
const worldInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "worldInfo.js"
));

// Weapons
const weapons = require(path.join(
  __dirname,
  "public",
  "data",
  "weapons.json"
));
const weaponsInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "weapons.js"
));

// ===== COMMUNITY ART (in-memory) =====
// This holds user-submitted community art while the server is running.
// (Like weapons, this is not persisted back to a file.)
const communityArt = [];
let nextCommunityId = 1;

// Ensure each weapon has an id
let nextWeaponId = 1;
weapons.forEach((w, index) => {
  if (w.id == null) {
    w.id = index + 1;
  }
  if (typeof w.id === "number" && w.id >= nextWeaponId) {
    nextWeaponId = w.id + 1;
  }
});

// ===== JOI SCHEMA FOR WEAPONS =====

const weaponSchema = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  category: Joi.string().required(),
  subclass: Joi.string().required(),
  type: Joi.string().required(),
  scaling: Joi.string().required(),
  requirements: Joi.string().required(),
  description: Joi.string().required(),
  img: Joi.string().required() // path like "/images/weapons/..."
});

// ===== JOI SCHEMA FOR COMMUNITY ART =====
// Very simple: user gives a title + image URL/path.
const communityArtSchema = Joi.object({
  title: Joi.string().required(),
  imageUrl: Joi.string().required() // can be http URL or /images/... path
});

// ===== ROOT =====

app.get("/", (req, res) => {
  res.send("Dark Souls III API is running.");
});

// ========== BOSSES API ==========

const buildBossList = (onlyDlc = null) => {
  return bosses
    .filter((b) => {
      if (onlyDlc === null) return true; // all
      if (onlyDlc === true) return !!b.isDlc; // only DLC
      return !b.isDlc; // only main game
    })
    .map((boss, index) => {
      const lore = bossInfo[boss.label] || bossInfo[boss.name] || {};
      return {
        id: index,
        ...boss,
        imgs: lore.imgs || [],
        text: lore.text || ""
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

// ========== CHARACTERS API ==========

app.get("/api/characters", (req, res) => {
  try {
    const keys = Object.keys(charactersInfo || {});
    const list = keys.map((name, index) => {
      const info = charactersInfo[name];
      return {
        id: index,
        name,
        ...info // area, imgs, text
      };
    });

    res.json(list);
  } catch (e) {
    console.error("Error building characters list:", e);
    res.status(500).json({ error: "Failed to build characters list" });
  }
});

// ========== WORLDS API ==========

app.get("/api/worlds", (req, res) => {
  try {
    const keys = Object.keys(worldInfo || {});
    const list = keys.map((name, index) => {
      const info = worldInfo[name];
      return {
        id: index,
        name,
        ...info // isDlc, imgs, text
      };
    });

    res.json(list);
  } catch (e) {
    console.error("Error building worlds list:", e);
    res.status(500).json({ error: "Failed to build worlds list" });
  }
});

// ========== WEAPONS API ==========

// Combine base weapon data with images + description
const buildWeaponList = () => {
  return weapons.map((w) => {
    const info = weaponsInfo[w.label] || weaponsInfo[w.name] || {};
    const imgsFromInfo = info.imgs || [];
    const imgsFromWeapon = w.imgs || (w.img ? [w.img] : []);

    return {
      id: w.id,
      name: w.name,
      label: w.label,
      category: w.category,
      subclass: w.subclass,
      type: w.type,
      scaling: w.scaling,
      requirements: w.requirements,
      description: w.description || info.text || "",
      imgs: imgsFromInfo.length ? imgsFromInfo : imgsFromWeapon
    };
  });
};

// GET: All weapons
app.get("/api/weapons", (req, res) => {
  try {
    const list = buildWeaponList();
    res.json(list);
  } catch (e) {
    console.error("Error building weapons list:", e);
    res.status(500).json({ error: "Failed to build weapons list" });
  }
});

// POST: Add a new weapon
app.post("/api/weapons", (req, res) => {
  const { error, value } = weaponSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: "Validation failed",
      details: error.details.map((d) => d.message)
    });
  }

  const newWeapon = {
    id: nextWeaponId++,
    ...value,
    imgs: value.imgs || (value.img ? [value.img] : [])
  };

  weapons.push(newWeapon);

  return res.status(201).json({
    ok: true,
    message: "Weapon added successfully",
    weapon: newWeapon
  });
});

// DELETE: Remove a weapon by id
app.delete("/api/weapons/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  const index = weapons.findIndex((w) => w.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      message: "Weapon not found"
    });
  }

  const removed = weapons.splice(index, 1)[0];

  return res.json({
    ok: true,
    message: "Weapon removed successfully",
    weapon: removed
  });
});

// ========== COMMUNITY ART API ==========

// GET: all community submissions
app.get("/api/community-art", (req, res) => {
  res.json(communityArt);
});

// POST: add a new community art entry
app.post("/api/community-art", (req, res) => {
  const { error, value } = communityArtSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      ok: false,
      message: "Validation failed",
      details: error.details.map((d) => d.message)
    });
  }

  const newArt = {
    id: nextCommunityId++,
    ...value
  };

  communityArt.push(newArt);

  return res.status(201).json({
    ok: true,
    message: "Community art added successfully",
    art: newArt
  });
});

// (Optional later) DELETE /api/community-art/:id if you want removals

// START SERVER
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
