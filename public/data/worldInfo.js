// public/data/worldInfo.js

// These keys ("Cemetery of Ash", "Firelink Shrine", etc.)
// will become world.name in /api/worlds

const worldInfo = {
  "Cemetery of Ash": {
    isDlc: false,
    // Make sure this file exists in: public/images/worlds/cemetery-of-ash.jpg
    imgs: ["/images/worlds/cemetary.jpeg"],
    text: "The Cemetery of Ash is the bleak starting area of Dark Souls III, where the Ashen One awakens among graves and ruined statues. It introduces basic enemies, a small tutorial layout, and the first boss, Iudex Gundyr. Ashen mists and crumbling stone create a mood of death and forgotten duty. This area acts as a quiet prologue before the world opens up."
  },

  "Firelink Shrine": {
    isDlc: false,
    // public/images/worlds/firelink-shrine.jpg
    imgs: ["/images/worlds/firelink.jpeg"],
    text: "Firelink Shrine serves as the main hub of Dark Souls III. NPCs you rescue throughout the game gather here, offering upgrades, spells, and lore. Beneath its calm music lies a sense of fading glory—thrones of absent Lords and a Fire Keeper tending the dwindling flame. From here, the Ashen One sets out to gather Cinders of the Lords."
  },

  "High Wall of Lothric": {
    isDlc: false,
    // public/images/worlds/high-wall-of-lothric.jpg
    imgs: ["/images/worlds/lotheric.jpeg"],
    text: "The High Wall of Lothric is a vast fortress overlooking the crumbling kingdom. Dragons cling to ramparts, hollows patrol abandoned courtyards, and embers drift in the air. This area connects Firelink Shrine to later zones like the Undead Settlement. It’s one of the first real tests of combat, level layout, and exploration."
  },

  "Undead Settlement": {
    isDlc: false,
    // public/images/worlds/undead-settlement.jpg
    imgs: ["/images/worlds/undead.jpeg"],
    text: "The Undead Settlement is a grim village where cursed undead are corralled and discarded. Twisted villagers, fanatical evangelists, and hanging corpses create a feeling of cruelty and loss. Important NPCs like Siegward, Cornyx, and Irina appear here. The area branches into secret paths, leading deeper into the game’s story and covenants."
  },

  "Cathedral of the Deep": {
    isDlc: false,
    // public/images/worlds/cathedral-of-the-deep.jpg
    imgs: ["/images/worlds/cathedral.jpeg"],
    text: "The Cathedral of the Deep is a massive, decaying church dedicated to dark faith and grotesque rituals. It is home to the Deacons of the Deep and is deeply tied to Aldrich. Sludge, hollows, and warped clergy fill its corridors, giving the zone a strong horror vibe. It marks a major step toward confronting one of the Lords of Cinder."
  },

  "Farron Keep": {
    isDlc: false,
    // public/images/worlds/farron-keep.jpg
    imgs: ["/images/worlds/farron.jpeg"],
    text: "Farron Keep is a poisonous swamp guarded by the followers of the Abyss Watchers. Ruined towers, burning braziers, and corrupted beasts lurk in the mire. The Ashen One must extinguish three flames to unlock the way forward. This area connects the legacy of Artorias to the new Legion sworn to fight the Abyss."
  },

  "Irithyll of the Boreal Valley": {
    isDlc: false,
    // public/images/worlds/irithyll-of-the-boreal-valley.jpg
    imgs: ["/images/worlds/boreal.jpeg"],
    text: "Irithyll of the Boreal Valley is a hauntingly beautiful frozen city bathed in eerie moonlight. Silver knights, pontiff knights, and dark spirits roam its bridges and plazas. The area leads toward Pontiff Sulyvahn and eventually to Anor Londo. Its skyline, music, and enemies make it one of the most iconic zones in the game."
  },

  "Anor Londo": {
    isDlc: false,
    // public/images/worlds/anor-londo.jpg
    imgs: ["/images/worlds/anor.jpeg"],
    text: "Anor Londo returns from Dark Souls I, now coated in snow and ruled by Aldrich. Its familiar towers and vast cathedral have been twisted by time and corruption. This area delivers huge lore payoffs for long-time players. Here, the Ashen One confronts Aldrich, Devourer of Gods, in a climactic battle."
  },

  "Painted World of Ariandel": {
    isDlc: true,
    // public/images/worlds/painted-world-of-ariandel.jpg
    imgs: ["/images/worlds/painted.jpeg"],
    text: "The Painted World of Ariandel is the rotting, frozen painting entered in the Ashes of Ariandel DLC. Snow-choked forests, burning trees, and desperate Corvians paint a picture of decay. Sister Friede seeks to preserve the painting, while others beg the Ashen One to burn it. The zone explores themes of cycles, rebirth, and decay."
  },

  "The Dreg Heap": {
    isDlc: true,
    // public/images/worlds/dreg-heap.jpg
    imgs: ["/images/worlds/dreg.jpeg"],
    text: "The Dreg Heap is a collapsing pile of fused kingdoms at the end of the world. Towers, castles, and cities from different ages are mashed together in a storm of ash. Angels and pilgrim enemies haunt the broken landscape. It serves as the surreal entry point to the final Ringed City journey."
  },

  "The Ringed City": {
    isDlc: true,
    // public/images/worlds/ringed-city.jpg
    imgs: ["/images/worlds/ring.jpeg"],
    text: "The Ringed City is the final, hidden city built for the Pygmy lords. Ringed Knights, Haralds, and other powerful foes patrol its warped beauty. At its heart lies Filianore and the last threads of the gods’ illusion. The Ashen One’s journey here ends with the battle against Slave Knight Gael and the fate of the Dark Soul."
  }
};

module.exports = worldInfo;
