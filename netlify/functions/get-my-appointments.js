const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { employeeEmail } = JSON.parse(event.body);
    const appointmentsStore = getStore('appointments-db');
    const raw = await appointmentsStore.get('appointments');
    const allApps = raw ? JSON.parse(raw) : [];
    const myApps = allApps.filter(a => a.employeeEmail === employeeEmail);
    return {
      statusCode: 200,
      body: JSON.stringify({ appointments: myApps }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};