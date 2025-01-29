const ClientModel = require('../models/newModel/clientModel');
const CampaignModel = require('../models/newModel/campaignModel');
const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MYEMAIL,
    pass: process.env.PASSWORD,
  },
});

// Get all client categories
const getCategories = async (req, res) => {
  try {
    const categories = await ClientModel.distinct('category');
    res.status(200).json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

// Send email to the selected client category
const sendEmailByCategory = async (req, res) => {
  const { category, subject, message } = req.body;

  if (!category || !subject || !message) {
    return res.status(400).json({ success: false, message: 'Category, subject, and message are required.' });
  }

  try {
    // Fetch all users in the selected category
    const clients = await ClientModel.find({ category });

    if (clients.length === 0) {
      return res.status(404).json({ success: false, message: 'No users found in this category.' });
    }

    // Send email to each user
    const emailPromises = clients.map((client) => {
      const mailOptions = {
        from: process.env.MYEMAIL,
        to: client.email,
        subject,
        html: message,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    // Save the campaign
    const newCampaign = new CampaignModel({ category, subject, message });
    await newCampaign.save();

    res.status(200).json({ success: true, message: 'Emails sent successfully.' });
  } catch (error) {
    console.error('Error sending emails:', error.message);
    res.status(500).json({ success: false, message: 'Internal Server Error', error });
  }
};

// Fetch all past campaigns
const getPastCampaigns = async (req, res) => {
  try {
    const campaigns = await CampaignModel.find().sort({ date: -1 });
    res.status(200).json(campaigns);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns.' });
  }
};

module.exports = {
  getCategories,
  sendEmailByCategory,
  getPastCampaigns,
};

