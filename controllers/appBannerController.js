
const upload = require ('../config/multerConfig');
const appBannerModel = require('../models/newModel/appBannerModel');

// Create a new banner
exports.createBanner = async (req, res) => {
  try {
    const result = req.file; // Uploaded file from Cloudinary
    if (!result) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const banner = new appBannerModel({
      imageUrl: result.path, // Cloudinary URL
    });

    await banner.save();
    res.status(201).json({ message: 'Banner created', banner });
  } catch (error) {
    res.status(500).json({ message: 'Error creating banner', error: error.message });
  }
};

// Get all banners
exports.getBanners = async (req, res) => {
  try {
    const banners = await appBannerModel.find().sort({ createdAt: -1 });
    res.status(200).json(banners);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching banners', error: error.message });
  }
};

// Delete a banner
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await appBannerModel.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
    res.status(200).json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting banner', error: error.message });
  }
};