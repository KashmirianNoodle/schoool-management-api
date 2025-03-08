require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const schoolRoutes = require("./routes/school.route");

app.use("/api", schoolRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = { app };
