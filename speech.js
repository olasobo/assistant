const Speech = require('@google-cloud/speech');
const projectId = 'assistant-174802';

module.exports = Speech({
  projectId,
});
