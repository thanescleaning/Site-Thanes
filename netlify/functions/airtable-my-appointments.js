const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'appointments';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    const { employeeEmail } = JSON.parse(event.body);
    const url = `https://api.airtable.com/v0/${baseId}/${table}?filterByFormula={employeeEmail}="${employeeEmail}"`;
    const resp = await axios.get(url, { headers });
    const appointments = resp.data.records.map(r => ({ id: r.id, ...r.fields }));
    return { statusCode: 200, body: JSON.stringify({ appointments }) };
  } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};