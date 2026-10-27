// Seeds a database with demo accounts and sample tours.
//   node scripts/seed.js
// Safe to run again: anything that already exists is skipped (passwords are never overwritten).
// Passwords are generated randomly and written ONLY to Backend/seed-credentials.local.txt (gitignored).
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const env = process.env.NODE_ENV || "development";
require("dotenv").config({ path: path.join(__dirname, "..", `.env.${env}`) });
const mongoose = require("mongoose");
const slugify = require("slugify");
const User = require("../src/models/userModel");
const Tour = require("../src/models/tourModel");

const CREDS_FILE = path.join(__dirname, "..", "seed-credentials.local.txt");
const makePassword = () => "Gg@" + crypto.randomBytes(7).toString("hex") + "9";

const ACCOUNTS = [
  { role: "owner", firstName: "Olivia", lastName: "Owner", email: "owner@goguided.demo", phone: "9000000001" },
  { role: "admin", firstName: "Aarav", lastName: "Admin", email: "admin@goguided.demo", phone: "9000000002" },
  { role: "guide", firstName: "Anjali", lastName: "Das", email: "anjali.guide@goguided.demo", phone: "9000000003" },
  { role: "guide", firstName: "Amit", lastName: "Joshi", email: "amit.guide@goguided.demo", phone: "9000000004" },
  { role: "user", firstName: "Tara", lastName: "Traveller", email: "traveller@goguided.demo", phone: "9000000005" },
];

// images that ship with the website (Frontend/public/images); replace through the admin dashboard
const IMAGES = ["/images/hero.webp", "/images/about_us.webp", "/images/contact-us.webp"].map((u, i) => ({ public_id: `seed/image-${i + 1}`, secure_url: u }));
const spot = (day, name, description, lat, lng) => ({ day, name, description, location: { type: "Point", coordinates: [lng, lat] } });
const daysFromNow = (n) => new Date(Date.now() + n * 864e5);

const TOURS = [
  {
    title: "Himalayan Adventure Expedition", location: "Manali, Himachal Pradesh, India", difficulty: "medium", duration: 7, participants: 15, pricePerPerson: 16500, startIn: 45,
    description: "Conquer the Himalayas in 7 days of thrilling adventure.",
    overview: "A 7-day journey through the mountains around Manali: snow points, river rafting, forest walks and local food, led by experienced local guides.",
    highlights: ["Trekking through Solang Valley and Rohtang Pass", "Bonfire and camping nights", "Visit to Hadimba Temple", "River rafting on the Beas", "Local Himachali cuisine"],
    included: ["Accommodation and meals", "Trekking gear and guide", "Transportation from Manali", "Medical and safety assistance", "Entry permits"],
    spots: [spot(1, "Mall Road, Manali", "Arrival and rest, short walk around the market.", 32.2396, 77.1887), spot(2, "Solang Valley", "Trek and snow activities with stunning views.", 32.3162, 77.1569), spot(3, "Rohtang Pass", "High-altitude drive and snow play.", 32.3716, 77.2466), spot(4, "Hadimba Temple", "Visit the cedar-forest temple.", 32.2482, 77.1809), spot(5, "Beas River, Kullu", "River rafting with safety crew.", 31.9578, 77.1095), spot(6, "Vashisht Hot Springs", "Hot springs and village walk.", 32.2641, 77.1859)],
  },
  {
    title: "Ladakh Pass Quest", location: "Ladakh", difficulty: "medium", duration: 6, participants: 12, pricePerPerson: 14800, startIn: 75,
    description: "A high-altitude trail exploring Ladakh's pristine valleys, Buddhist heritage and dramatic mountain passes.",
    overview: "Venture into the heart of Ladakh on a 6-day guided trip through ancient monasteries, desert valleys and high passes. Designed for travellers with some experience.",
    highlights: ["Hemis Monastery", "Pangong Lake sunrise", "Nubra Valley dunes", "Khardung La pass"],
    included: ["Stay in guesthouses and camps", "Guide and driver", "Oxygen and first-aid kit", "Permits", "Breakfast and dinner"],
    spots: [spot(1, "Leh", "Arrival and acclimatisation.", 34.1526, 77.5771), spot(2, "Hemis Monastery", "Largest monastery in Ladakh.", 33.9157, 77.7025), spot(3, "Khardung La", "One of the highest motorable passes.", 34.2796, 77.6044), spot(4, "Nubra Valley", "Sand dunes and double-humped camels.", 34.5444, 77.5605), spot(5, "Pangong Lake", "Overnight at the lake.", 33.7595, 78.6674)],
  },
  {
    title: "Desert Fort Circuit", location: "Rajasthan", difficulty: "easy", duration: 5, participants: 10, pricePerPerson: 8800, startIn: 105,
    description: "A cultural trail exploring Rajasthan's ancient forts, desert villages and local arts.",
    overview: "Five relaxed days through Jaipur, Jodhpur and Jaisalmer with fort visits, folk music, local markets and a night in the dunes.",
    highlights: ["Amer Fort", "Mehrangarh Fort", "Jaisalmer Fort", "Camel ride at the Khuri dunes", "Folk music evening"],
    included: ["Heritage hotel stay", "Breakfast", "AC transport", "Guide", "Fort entry tickets"],
    spots: [spot(1, "Amer Fort, Jaipur", "Palace complex above Maota Lake.", 26.9855, 75.8513), spot(2, "Mehrangarh Fort, Jodhpur", "The blue city's great fort.", 26.2976, 73.0186), spot(3, "Jaisalmer Fort", "Living fort in golden sandstone.", 26.9124, 70.9129), spot(4, "Khuri Sand Dunes", "Sunset, camel ride and folk music.", 26.7875, 70.733)],
  },
  {
    title: "Living Root Bridge Trail", location: "Meghalaya", difficulty: "easy", duration: 4, participants: 12, pricePerPerson: 12400, startIn: 135,
    description: "A misty rainforest trek through living root bridges, waterfalls and Khasi village trails.",
    overview: "Four days in the wettest part of India: living root bridges, waterfalls, clear rivers and village life.",
    highlights: ["Double Decker Living Root Bridge", "Nohkalikai Falls", "Mawlynnong village", "Dawki river boat ride"],
    included: ["Homestay and meals", "Local guide", "Transport", "Entry fees"],
    spots: [spot(1, "Shillong", "Arrival and city walk.", 25.5788, 91.8933), spot(2, "Nohkalikai Falls, Cherrapunji", "India's tallest plunge waterfall.", 25.2763, 91.69), spot(3, "Double Decker Root Bridge, Nongriat", "Trek down the stone steps.", 25.2535, 91.73), spot(4, "Mawlynnong", "Clean village and sky walk.", 25.2, 91.9167), spot(4, "Dawki, Umngot River", "Boat ride on glass-clear water.", 25.1867, 92.0233)],
  },
];

(async () => {
  await mongoose.connect(process.env.DB_URI, { dbName: process.env.DB_NAME, serverSelectionTimeoutMS: 20000 });
  console.log(`Connected to database "${process.env.DB_NAME}"`);
  const lines = ["Go Guided demo accounts (generated by scripts/seed.js)", "Keep this file private. It is gitignored.", ""];
  const ids = {};

  for (const a of ACCOUNTS) {
    const found = await User.findOne({ email: a.email });
    if (found) {
      ids[a.email] = found._id;
      lines.push(`${a.role.padEnd(6)} ${a.email}   (already existed, password unchanged)`);
      continue;
    }
    const password = makePassword();
    const u = await User.create({ ...a, password });
    ids[a.email] = u._id;
    lines.push(`${a.role.padEnd(6)} ${a.email}   password: ${password}`);
    console.log(`  created ${a.role}: ${a.email}`);
  }

  const guides = [ids["anjali.guide@goguided.demo"], ids["amit.guide@goguided.demo"]];
  for (const t of TOURS) {
    const slug = slugify(t.title, { lower: true });
    if (await Tour.findOne({ slug })) { console.log(`  tour exists: ${t.title}`); continue; }
    const start = daysFromNow(t.startIn);
    await Tour.create({
      title: t.title, slug, description: t.description, location: t.location, tourSpots: t.spots,
      duration: t.duration, participants: t.participants, difficulty: t.difficulty, languages: ["English", "Hindi"],
      startDate: start, endDate: new Date(start.getTime() + (t.duration - 1) * 864e5), overview: t.overview,
      highlights: t.highlights, included: t.included, guides, thumbnail: IMAGES[0], images: IMAGES,
      pricePerPerson: t.pricePerPerson, currency: "INR",
    });
    console.log(`  created tour: ${t.title}`);
  }

  fs.writeFileSync(CREDS_FILE, lines.join("\n") + "\n", { mode: 0o600 });
  console.log(`\nDone. Logins are in ${path.relative(process.cwd(), CREDS_FILE)}`);
  console.log(`Users in DB: ${await User.countDocuments()}, tours: ${await Tour.countDocuments()}`);
  process.exit(0);
})().catch((e) => { console.error("Seed failed:", e.message); process.exit(1); });
