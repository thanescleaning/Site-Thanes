const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const table = 'jobs';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    const { jobId, employeeEmail, employeeName } = JSON.parse(event.body);
    const url = `https://api.airtable.com/v0/${baseId}/${table}/${jobId}`;
    const record = await axios.get(url, { headers });
    let applicants = record.data.fields.applicants ? JSON.parse(record.data.fields.applicants) : [];
    if (applicants.some(a => a.email === employeeEmail)) return { statusCode: 400, body: 'Already applied' };
    const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
    if (acceptedCount >= record.data.fields.slots) return { statusCode: 400, body: 'Job full' };
    applicants.push({ email: employeeEmail, name: employeeName, status: 'pending', appliedAt: new Date().toISOString() });
    await axios.patch(url, { fields: { applicants: JSON.stringify(applicants) } }, { headers });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};