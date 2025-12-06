// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Joi = require("joi");
const mongoose = require("mongoose");

const app = express();
const PORT = process.env.PORT || 3001;

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ds3db";

// ===== STATIC DATA (for lore + seeding) =====
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

const weaponsSeed = require(path.join(
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

// ===== EXPRESS MIDDLEWARE =====
app.use("/images", express.static(path.join(__dirname, "public", "images")));
app.use(cors());
app.use(express.json());

// ===== MONGOOSE SCHEMAS / MODELS =====

const weaponMongoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    label: { type: String, required: true },
    category: { type: String, required: true },
    subclass: { type: String, required: true },
    type: { type: String, required: true },
    scaling: { type: String, required: true },
    requirements: { type: String, required: true },
    description: { type: String, required: true },
    // Make img NOT required so seeding can fall back, and set a default
    img: {
      type: String,
      required: false,
      default: "/images/weapons/default.png"
    },
    imgs: [String]
  },
  { timestamps: true }
);

const Weapon = mongoose.model("Weapon", weaponMongoSchema);

const communityArtMongoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    imageUrl: { type: String, required: true }
  },
  { timestamps: true }
);

const CommunityArt = mongoose.model("CommunityArt", communityArtMongoSchema);

// ===== JOI SCHEMAS =====

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

const communityUpdateSchema = Joi.object({
  title: Joi.string().required(),
  imageUrl: Joi.string().optional()
});

// ===== CONNECT TO MONGO + SEED WEAPONS ONCE =====

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    try {
      const weaponCount = await Weapon.countDocuments();
      if (weaponCount === 0) {
        console.log("Weapons collection empty – seeding from weapons.json...");

        const toInsert = weaponsSeed.map((w) => {
          const info = weaponsInfo[w.label] || weaponsInfo[w.name] || {};

          const imgFromInfo =
            info.imgs && info.imgs.length > 0 ? info.imgs[0] : null;
          const imgFromWeaponArr =
            w.imgs && w.imgs.length > 0 ? w.imgs[0] : null;
          const imgFromWeaponField =
            w.img && w.img.trim() !== "" ? w.img : null;

          const img =
            imgFromInfo ||
            imgFromWeaponArr ||
            imgFromWeaponField ||
            "/images/weapons/default.png";

          const imgs =
            (info.imgs && info.imgs.length > 0 && info.imgs) ||
            (w.imgs && w.imgs.length > 0 && w.imgs) ||
            (img ? [img] : []);

          return {
            name: w.name,
            label: w.label,
            category: w.category,
            subclass: w.subclass,
            type: w.type,
            scaling: w.scaling,
            requirements: w.requirements,
            description: w.description || info.text || "",
            img,
            imgs
          };
        });

        await Weapon.insertMany(toInsert);
        console.log(`Seeded ${toInsert.length} weapons into MongoDB.`);
      } else {
        console.log(`Weapons collection already has ${weaponCount} docs – no seed.`);
      }
    } catch (err) {
      console.error("Error seeding weapons:", err);
    }
  })
  .catch((err) => console.error("MongoDB connection error:", err));

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

// ========== WEAPONS API (MongoDB + static fallback) ==========

// Build list from Mongo docs
const buildWeaponListFromDocs = (docs) => {
  return docs.map((w) => {
    const info = weaponsInfo[w.label] || weaponsInfo[w.name] || {};
    const imgsFromInfo = info.imgs || [];
    const imgsFromWeapon =
      (w.imgs && w.imgs.length > 0 && w.imgs) || (w.img ? [w.img] : []);

    const imgs = imgsFromInfo.length ? imgsFromInfo : imgsFromWeapon;
    const img = imgs[0] || "/images/weapons/default.png";

    return {
      id: w._id.toString(),
      name: w.name,
      label: w.label,
      category: w.category,
      subclass: w.subclass,
      type: w.type,
      scaling: w.scaling,
      requirements: w.requirements,
      description: w.description || info.text || "",
      img,
      imgs
    };
  });
};

// Build list from static JSON/JS files
const buildWeaponListFromStatic = () => {
  console.warn(
    "Using static weapons.json + weapons.js as fallback (no DB weapons)."
  );

  return weaponsSeed.map((w, index) => {
    const info = weaponsInfo[w.label] || weaponsInfo[w.name] || {};

    const imgsFromInfo = info.imgs || [];
    const imgsFromWeapon =
      (w.imgs && w.imgs.length > 0 && w.imgs) || (w.img ? [w.img] : []);

    const imgs = imgsFromInfo.length ? imgsFromInfo : imgsFromWeapon;
    const img = imgs[0] || "/images/weapons/default.png";

    return {
      id: `static-${index}`,
      name: w.name,
      label: w.label,
      category: w.category,
      subclass: w.subclass,
      type: w.type,
      scaling: w.scaling,
      requirements: w.requirements,
      description: w.description || info.text || "",
      img,
      imgs
    };
  });
};

const buildWeaponList = async () => {
  try {
    const docs = await Weapon.find().lean();

    if (docs && docs.length > 0) {
      // Use DB weapons if present
      return buildWeaponListFromDocs(docs);
    }

    // Otherwise fall back to static data
    return buildWeaponListFromStatic();
  } catch (err) {
    console.error(
      "Error fetching weapons from MongoDB, falling back to static data:",
      err
    );
    return buildWeaponListFromStatic();
  }
};

app.get("/api/weapons", async (req, res) => {
  try {
    const list = await buildWeaponList();
    res.json(list);
  } catch (e) {
    console.error("Error building weapons list:", e);
    res.status(500).json({ error: "Failed to build weapons list" });
  }
});

app.post("/api/weapons", async (req, res) => {
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

  try {
    const imgs = value.imgs || (value.img ? [value.img] : []);
    const created = await Weapon.create({
      ...value,
      imgs
    });

    return res.status(201).json({
      ok: true,
      message: "Weapon added successfully",
      weapon: {
        id: created._id.toString(),
        name: created.name,
        label: created.label,
        category: created.category,
        subclass: created.subclass,
        type: created.type,
        scaling: created.scaling,
        requirements: created.requirements,
        description: created.description,
        img: created.img,
        imgs: created.imgs
      }
    });
  } catch (e) {
    console.error("Error creating weapon:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to create weapon"
    });
  }
});

app.put("/api/weapons/:id", async (req, res) => {
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

  const id = req.params.id;

  const update = {
    name: value.name,
    type: value.type,
    scaling: value.scaling,
    requirements: value.requirements,
    description: value.description
  };

  if (value.img) {
    update.img = value.img;
    update.imgs = [value.img];
  }

  try {
    const updated = await Weapon.findByIdAndUpdate(id, update, {
      new: true
    }).lean();

    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: "Weapon not found"
      });
    }

    return res.json({
      ok: true,
      message: "Weapon updated successfully",
      weapon: {
        id: updated._id.toString(),
        name: updated.name,
        label: updated.label,
        category: updated.category,
        subclass: updated.subclass,
        type: updated.type,
        scaling: updated.scaling,
        requirements: updated.requirements,
        description: updated.description,
        img: updated.img,
        imgs: updated.imgs
      }
    });
  } catch (e) {
    console.error("Error updating weapon:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to update weapon"
    });
  }
});

app.delete("/api/weapons/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const removed = await Weapon.findByIdAndDelete(id).lean();

    if (!removed) {
      return res.status(404).json({
        ok: false,
        message: "Weapon not found"
      });
    }

    return res.json({
      ok: true,
      message: "Weapon removed successfully",
      weapon: {
        id: removed._id.toString(),
        name: removed.name,
        label: removed.label,
        category: removed.category,
        subclass: removed.subclass,
        type: removed.type,
        scaling: removed.scaling,
        requirements: removed.requirements,
        description: removed.description,
        img: removed.img,
        imgs: removed.imgs
      }
    });
  } catch (e) {
    console.error("Error deleting weapon:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to delete weapon"
    });
  }
});

// ========== COMMUNITY ART API (MongoDB) ==========

app.get("/api/community-art", async (req, res) => {
  try {
    const art = await CommunityArt.find().lean();
    res.json(art);
  } catch (e) {
    console.error("Error fetching community art:", e);
    res
      .status(500)
      .json({ ok: false, message: "Failed to fetch community art" });
  }
});

app.post("/api/community-art", async (req, res) => {
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

  try {
    const created = await CommunityArt.create(value);

    return res.status(201).json({
      ok: true,
      message: "Community art added successfully",
      art: created
    });
  } catch (e) {
    console.error("Error creating community art:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to create community art"
    });
  }
});

app.put("/api/community-art/:id", async (req, res) => {
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

  const id = req.params.id;

  const update = {
    title: value.title
  };

  if (value.imageUrl) {
    update.imageUrl = value.imageUrl;
  }

  try {
    const updated = await CommunityArt.findByIdAndUpdate(id, update, {
      new: true
    }).lean();

    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: "Artwork not found"
      });
    }

    return res.json({
      ok: true,
      message: "Artwork updated successfully",
      art: updated
    });
  } catch (e) {
    console.error("Error updating artwork:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to update artwork"
    });
  }
});

app.delete("/api/community-art/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const removed = await CommunityArt.findByIdAndDelete(id).lean();

    if (!removed) {
      return res.status(404).json({
        ok: false,
        message: "Artwork not found"
      });
    }

    return res.json({
      ok: true,
      message: "Artwork removed successfully",
      art: removed
    });
  } catch (e) {
    console.error("Error deleting artwork:", e);
    return res.status(500).json({
      ok: false,
      message: "Failed to delete artwork"
    });
  }
});

// ===== START SERVER =====

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
