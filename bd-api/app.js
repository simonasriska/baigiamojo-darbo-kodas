const express = require('express');
const sequelize = require('./config/database');
const photoRoutes = require('./routes/photos');
const cors = require('cors');

const app = express();
const port = 3000;

sequelize.sync();

app.use(express.json());
app.use(cors());

app.use('/photos', photoRoutes);

if (!module.parent) {
  app.listen(port, () => {
    console.log(`API veikia: http://localhost:${port}`);
  });
}

module.exports = app;