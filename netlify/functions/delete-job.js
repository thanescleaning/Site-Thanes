const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { jobId, adminEmail } = JSON.parse(event.body);
    if (adminEmail !== 'thanescleaning@gmail.com') {
      return { statusCode: 403, body: 'Non autorisé' };
    }
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    let jobs = raw ? JSON.parse(raw) : [];
    jobs = jobs.filter(j => j.id !== jobId);
    await store.set('jobs', JSON.stringify(jobs));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};