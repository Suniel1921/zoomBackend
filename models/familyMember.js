const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FamilyMember = sequelize.define('FamilyMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    relationship: {
      type: DataTypes.STRING,
      allowNull: false
    },
    includedInApplication: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  });

  FamilyMember.associate = (models) => {
    FamilyMember.belongsTo(models.Client);
  };

  return FamilyMember;
};