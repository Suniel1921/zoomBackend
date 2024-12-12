const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Client = sequelize.define('Client', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    address: {
      type: DataTypes.JSON,
      allowNull: false
    },
    profilePhoto: {
      type: DataTypes.STRING
    },
    socialMedia: {
      type: DataTypes.JSON
    },
    modeOfContact: {
      type: DataTypes.JSON
    }
  });

  Client.associate = (models) => {
    Client.belongsTo(models.User);
    Client.hasMany(models.Application);
    Client.hasMany(models.Appointment);
    Client.hasMany(models.Document);
    Client.hasMany(models.FamilyMember);
  };

  return Client;
};