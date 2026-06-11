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
    } catch (err) {
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      console.log('📥 Données reçues pour création job:', body);
      const { date, time, type, address, slots, pay, notes, adminEmail } = body;
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      
      const fields = { 
        date, time, type, address, 
        slots: parseInt(slots), 
        pay, notes, 
        applicants: '[]' 
      };
      console.log('📤 Envoi à Airtable:', JSON.stringify({ fields }, null, 2));
      
      const resp = await axios.post(url, { fields }, { headers });
      console.log('✅ Réponse Airtable:', resp.data);
      return { statusCode: 200, body: JSON.stringify({ success: true, job: { id: resp.data.id, ...resp.data.fields } }) };
    } catch (err) {
      console.error('❌ Erreur Airtable:', err.response?.data || err.message);
      return { statusCode: 500, body: JSON.stringify({ error: err.response?.data?.error?.message || err.message }) };
    }
  }

  // PATCH et DELETE inchangés (mais vous pouvez aussi ajouter des logs)
  if (event.httpMethod === 'PATCH') {
    try {
      const { jobId, applicantEmail, status, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      const recordUrl = `${url}/${jobId}`;
      const record = await axios.get(recordUrl, { headers });
      let applicants = record.data.fields.applicants ? JSON.parse(record.data.fields.applicants) : [];
      const idx = applicants.findIndex(a => a.email === applicantEmail);
      if (idx !== -1) applicants[idx].status = status;
      else applicants.push({ email: applicantEmail, status });
      await axios.patch(recordUrl, { fields: { applicants: JSON.stringify(applicants) } }, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { jobId, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') return { statusCode: 403, body: 'Unauthorized' };
      await axios.delete(`${url}/${jobId}`, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};