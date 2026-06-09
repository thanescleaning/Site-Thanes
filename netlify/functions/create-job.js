const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { date, time, type, address, slots, pay, notes, adminEmail } = JSON.parse(event.body);
    // Vérifier que l'admin est bien thanescleaning@gmail.com
    if (adminEmail !== 'thanescleaning@gmail.com') {
      return { statusCode: 403, body: 'Non autorisé' };
    }
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    const jobs = raw ? JSON.parse(raw) : [];
    const newJob = {
      id: 'job_' + Date.now(),
      date,
      time,
      type,
      address,
      slots: parseInt(slots) || 1,
      pay: pay || '',
      notes: notes || '',
      applicants: [],
      createdAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    await store.set('jobs', JSON.stringify(jobs));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, job: newJob }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};