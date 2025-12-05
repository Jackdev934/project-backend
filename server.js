// server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");

const app = express();
const PORT = process.env.PORT || 3001;

app.use("/images", express.static(path.join(__dirname, "public", "images")));

app.use(cors());
app.use(express.json());

// ===== DATA REQUIRES =====

const bosses = require(path.join(__dirname, "public", "data", "bosses.json"));
const bossInfo = require(path.join(__dirname, "public", "data", "bossInfo.js"));

const charactersInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "charactersInfo.js"
));

const worldInfo = require(path.join(
  __dirname,
  "public",
  "data",
  "worldInfo.js"
));

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

const communityArt = [];
let nextCommunityId = 1;

let nextWeaponId = 1;
weapons.forEach((w, index) => {
  if (w.id == null) {
    w.id = index + 1;
  }
  if (typeof w.id === "number" && w.id >= nextWeaponId) {
    nextWeaponId = w.id + 1;
  }
});

const weaponSchema = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  category: Joi.string().required(),
  subclass: Joi.string().required(),
  type: Joi.string().required(),
  scaling: Joi.string().required(),
  requirements: Joi.string().required(),
  description: Joi.string().required(),
  img: Joi.string().required()
});

// UPDATED: allow optional img on update so we can change the weapon image
const weaponUpdateSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().required(),
  scaling: Joi.string().required(),
  requirements: Joi.string().required(),
  description: Joi.string().required(),
  img: Joi.string().optional()
});

const communityArtSchema = Joi.object({
  title: Joi.string().required(),
  imageUrl: Joi.string().required()
});

// UPDATED: allow optional imageUrl on community edit
const communityUpdateSchema = Joi.object({
  title: Joi.string().required(),
  imageUrl: Joi.string().optional()
});

// ===== ROOT =====

app.get("/", (req, res) => {
  res.send("Dark Souls III API is running.");
});

// ========== BOSSES API ==========

const buildBossList = (onlyDlc = null) => {
  return bosses
    .filter((b) => {
      if (onlyDlc === null) return true;
      if (onlyDlc === true) return !!b.isDlc;
      return !b.isDlc;
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

app.get("/api/bosses", (req, res) => {
  const combined = buildBossList(null);
  res.json(combined);
});

app.get("/api/bosses/main", (req, res) => {
  const combined = buildBossList(false);
  res.json(combined);
});

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
        ...info
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
        ...info
      };
    });

    res.json(list);
  } catch (e) {
    console.error("Error building worlds list:", e);
    res.status(500).json({ error: "Failed to build worlds list" });
  }
});

// ========== WEAPONS API ==========

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

app.get("/api/weapons", (req, res) => {
  try {
    const list = buildWeaponList();
    res.json(list);
  } catch (e) {
    console.error("Error building weapons list:", e);
    res.status(500).json({ error: "Failed to build weapons list" });
  }
});

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

// UPDATED: update weapon, including optional img field
app.put("/api/weapons/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = weapons.findIndex((w) => w.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      message: "Weapon not found"
    });
  }

  const { error, value } = weaponUpdateSchema.validate(req.body, {
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

  // Always update text fields
  weapons[index] = {
    ...weapons[index],
    name: value.name,
    type: value.type,
    scaling: value.scaling,
    requirements: value.requirements,
    description: value.description
  };

  // If an img was provided in the update, update img + imgs array
  if (value.img) {
    weapons[index].img = value.img;
    weapons[index].imgs = [value.img];
  }

  return res.json({
    ok: true,
    message: "Weapon updated successfully",
    weapon: weapons[index]
  });
});

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

app.get("/api/community-art", (req, res) => {
  res.json(communityArt);
});

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

app.put("/api/community-art/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = communityArt.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      message: "Artwork not found"
    });
  }

  const { error, value } = communityUpdateSchema.validate(req.body, {
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

  // Always update title
  communityArt[index].title = value.title;

  // Optionally update imageUrl if provided (so Edit Image works)
  if (value.imageUrl) {
    communityArt[index].imageUrl = value.imageUrl;
  }

  return res.json({
    ok: true,
    message: "Artwork updated successfully",
    art: communityArt[index]
  });
});

app.delete("/api/community-art/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const index = communityArt.findIndex((a) => a.id === id);

  if (index === -1) {
    return res.status(404).json({
      ok: false,
      message: "Artwork not found"
    });
  }

  const removed = communityArt.splice(index, 1)[0];

  return res.json({
    ok: true,
    message: "Artwork removed successfully",
    art: removed
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
