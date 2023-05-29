const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DetectedObject = sequelize.define('DetectedObject', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  objectName: {
    type: DataTypes.STRING,
  },
  relativeSize: {
    type: DataTypes.FLOAT,
  },
});

module.exports = DetectedObject;