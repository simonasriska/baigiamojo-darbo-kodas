const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const DetectedObject = require('./detectedObject');

const Photo = sequelize.define('Photo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  photo: {
    type: DataTypes.BLOB,
  },
  target: {
    type: DataTypes.INTEGER,
  },
});

Photo.hasMany(DetectedObject, { onDelete: 'CASCADE' });
DetectedObject.belongsTo(Photo);

module.exports = Photo;