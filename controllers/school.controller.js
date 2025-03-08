const { db } = require("../db");
const Joi = require("joi");

const schoolSchema = Joi.object({
  name: Joi.string().min(3).required(),
  address: Joi.string().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const addSchool = async (req, res) => {
  try {
    const { error, value } = schoolSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, address, latitude, longitude } = value;

    const [result] = await db.execute("INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)", [name, address, latitude, longitude]);

    res.status(201).json({ message: "School added successfully", schoolId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const listSchools = async (req, res) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and Longitude are required" });
    }

    const userLat = parseFloat(latitude);
    const userLon = parseFloat(longitude);

    if (isNaN(userLat) || isNaN(userLon)) {
      return res.status(400).json({ error: "Invalid coordinates" });
    }

    const [schools] = await db.execute("SELECT * FROM schools");

    const sortedSchools = schools
      .map((school) => ({
        ...school,
        distance: haversineDistance(userLat, userLon, school.latitude, school.longitude),
      }))
      .sort((a, b) => a.distance - b.distance);

    res.status(200).json({ schools: sortedSchools });
  } catch (err) {
    res.status(500).json({ error: "Database error", details: err.message });
  }
};

module.exports = { addSchool, listSchools };
