const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'slots';
  if (!token || !baseId) return { statusCode: 500, body: 'Missing env' };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const url = `https://api.airtable.com/v0/${baseId}/${table}`;

  if (event.httpMethod === 'GET') {
    try {
      const resp = await axios.get(url, { headers });
      const slots = resp.data.records.map(r => ({ id: r.id, ...r.fields }));
      return { statusCode: 200, body: JSON.stringify({ slots }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { date, start, duration, maxPlaces, type, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      const fields = { id: 'slot_' + Date.now(), date, start, duration, maxPlaces, type };
      const resp = await axios.post(url, { fields }, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true, slot: { id: resp.data.id, ...resp.data.fields } }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { slotId, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      await axios.delete(`${url}/${slotId}`, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};