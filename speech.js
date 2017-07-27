const Speech = require('@google-cloud/speech');
const projectId = 'assistant-174802';

module.exports = Speech({
  projectId,
  credentials: {
    client_email: process.env.GOOGLE_CLOUD_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY,
  },
});
