const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  try {
    const url = `https://api.airtable.com/v0/${baseId}/jobs`;
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
    return { statusCode: 200, body: JSON.stringify({ success: true, recordsCount: response.data.records.length }) };
  } catch (error) {
    console.error('Airtable error:', error.response?.data || error.message);
    return { statusCode: 500, body: JSON.stringify({ error: error.response?.data || error.message }) };
  }
};