const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'jobs';
  if (!token || !baseId) return { statusCode: 500, body: 'Missing env' };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const url = `https://api.airtable.com/v0/${baseId}/${table}`;

  if (event.httpMethod === 'GET') {
    try {
      const resp = await axios.get(url, { headers });
      const records = resp.data.records.map(r => ({ id: r.id, ...r.fields }));
      return { statusCode: 200, body: JSON.stringify({ jobs: records }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  if (event.httpMethod === 'POST') {
    try {
      const { date, time, type, address, slots, pay, notes, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      const fields = { id: 'job_' + Date.now(), date, time, type, address, slots: parseInt(slots), pay, notes, applicants: '[]', createdAt: new Date().toISOString() };
      const resp = await axios.post(url, { fields }, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true, job: { id: resp.data.id, ...resp.data.fields } }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  if (event.httpMethod === 'PATCH') {
    try {
      const { jobId, applicantEmail, status } = JSON.parse(event.body);
      const recordUrl = `${url}/${jobId}`;
      const record = await axios.get(recordUrl, { headers });
      let applicants = record.data.fields.applicants ? JSON.parse(record.data.fields.applicants) : [];
      const idx = applicants.findIndex(a => a.email === applicantEmail);
      if (idx !== -1) applicants[idx].status = status;
      await axios.patch(recordUrl, { fields: { applicants: JSON.stringify(applicants) } }, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { jobId } = JSON.parse(event.body);
      await axios.delete(`${url}/${jobId}`, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};