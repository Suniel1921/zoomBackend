const crypto = require('crypto');

const SECRET_KEY = process.env.SECRET_KEY || 'your-secret-key';  // Use a strong secret key and keep it safe
const ALGORITHM = 'aes-256-cbc';  // Symmetric encryption algorithm
const IV_LENGTH = 16;  // Initialization vector length for AES

const encrypt = (data) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return iv.toString('base64') + ':' + encrypted;  // Save IV and encrypted data together
};

const decrypt = (encryptedData) => {
  try {
    const [ivString, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivString, 'base64');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET_KEY, 'hex'), iv);
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;  // Decrypted string
  } catch (error) {
    console.error('Decryption failed:', error);
    return 'Decryption failed. Please check the data.';
  }
};

module.exports = { encrypt, decrypt };
