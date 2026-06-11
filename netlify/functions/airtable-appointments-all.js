const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) return { statusCode: 500, body: 'Missing env' };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const url = `https://api.airtable.com/v0/${baseId}/appointments`;

  try {
    const resp = await axios.get(url, { headers });
    const appointments = resp.data.records.map(r => ({ id: r.id, ...r.fields }));
    return { statusCode: 200, body: JSON.stringify({ appointments }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};