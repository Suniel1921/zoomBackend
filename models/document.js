const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
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
    type: {
      type: DataTypes.ENUM('Visa', 'Financial', 'Translation', 'Contract', 'Other'),
      allowNull: false
    },
    category: {
      type: DataTypes.ENUM('Application', 'Personal', 'Financial', 'Legal'),
      allowNull: false
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    size: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    uploadDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastModified: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.ENUM('Active', 'Archived', 'Deleted'),
      defaultValue: 'Active'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    permissions: {
      type: DataTypes.JSON,
      defaultValue: {
        canView: [],
        canEdit: [],
        canDelete: []
      }
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  });

  Document.associate = (models) => {
    Document.belongsTo(models.Client);
  };

  return Document;
};