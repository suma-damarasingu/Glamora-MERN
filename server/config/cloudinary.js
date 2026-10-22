const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Uploads a file buffer or path to Cloudinary, or falls back to local static URL.
 */
const uploadToCloudinary = async (filePathOrBuffer, folder = 'glamora') => {
  if (isCloudinaryConfigured) {
    const result = await cloudinary.uploader.upload(filePathOrBuffer, {
      folder: `glamora/${folder}`,
      resource_type: 'auto'
    });
    return result.secure_url;
  }
  return null;
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary
};
