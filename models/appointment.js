const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
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
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    time: {
      type: DataTypes.STRING,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER,
      defaultValue: 60
    },
    status: {
      type: DataTypes.ENUM('Scheduled', 'Completed', 'Cancelled'),
      defaultValue: 'Scheduled'
    },
    meetingType: {
      type: DataTypes.ENUM('physical', 'online'),
      allowNull: false
    },
    location: DataTypes.STRING,
    meetingLink: DataTypes.STRING,
    notes: DataTypes.TEXT,
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringFrequency: {
      type: DataTypes.ENUM('weekly', 'biweekly', 'monthly')
    },
    completedAt: DataTypes.DATE,
    cancelledAt: DataTypes.DATE,
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderType: {
      type: DataTypes.ENUM('email', 'sms', 'both')
    },
    handledBy: DataTypes.STRING
  });

  Appointment.associate = (models) => {
    Appointment.belongsTo(models.Client);
  };

  return Appointment;
};