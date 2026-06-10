const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = 'jobs';

  if (!token || !baseId) {
    return { statusCode: 500, body: 'Configuration Airtable manquante' };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // GET : récupérer tous les jobs
  if (event.httpMethod === 'GET') {
    try {
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
      const response = await axios.get(url, { headers });
      const jobs = response.data.records.map(record => ({
        id: record.id,
        ...record.fields,
      }));
      return {
        statusCode: 200,
        body: JSON.stringify({ jobs }),
      };
    } catch (error) {
      console.error('GET error:', error);
      return { statusCode: 500, body: 'Erreur récupération jobs' };
    }
  }

  // POST : créer un nouveau job
  if (event.httpMethod === 'POST') {
    try {
      const { date, time, type, address, slots, pay, notes, adminEmail } = JSON.parse(event.body);
      if (adminEmail !== 'thanescleaning@gmail.com') {
        return { statusCode: 403, body: 'Unauthorized' };
      }
      const fields = {
        id: 'job_' + Date.now(),
        date,
        time,
        type,
        address,
        slots: parseInt(slots),
        pay: pay || '',
        notes: notes || '',
        applicants: '[]',
        createdAt: new Date().toISOString(),
      };
      const url = `https://api.airtable.com/v0/${baseId}/${tableName}`;
      const response = await axios.post(url, { fields }, { headers });
      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, job: { id: response.data.id, ...response.data.fields } }),
      };
    } catch (error) {
      console.error('POST error:', error);
      return { statusCode: 500, body: 'Erreur création job' };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};