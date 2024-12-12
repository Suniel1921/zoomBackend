const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Application = sequelize.define('Application', {
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
    type: {
      type: DataTypes.ENUM('Visitor Visa', 'Student Visa'),
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    documentStatus: {
      type: DataTypes.ENUM('Not Yet', 'Few Received', 'Fully Received'),
      defaultValue: 'Not Yet'
    },
    documentsToTranslate: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    translationStatus: {
      type: DataTypes.ENUM('Under Process', 'Completed'),
      defaultValue: 'Under Process'
    },
    visaStatus: {
      type: DataTypes.ENUM('Under Review', 'Under Process', 'Waiting for Payment', 'Completed', 'Approved', 'Rejected'),
      defaultValue: 'Under Review'
    },
    handledBy: {
      type: DataTypes.STRING,
      allowNull: false
    },
    translationHandler: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: false
    },
    payment: {
      type: DataTypes.JSON,
      defaultValue: {
        visaApplicationFee: 0,
        translationFee: 0,
        paidAmount: 0,
        discount: 0,
        total: 0
      }
    },
    paymentStatus: {
      type: DataTypes.ENUM('Due', 'Paid'),
      defaultValue: 'Due'
    },
    notes: DataTypes.TEXT,
    familyMembers: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    todos: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  });

  Application.associate = (models) => {
    Application.belongsTo(models.Client);
  };

  return Application;
};