const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    const jobs = raw ? JSON.parse(raw) : [];
    // Optionnel : ne renvoyer que les jobs futurs ou tous, selon besoin
    return {
      statusCode: 200,
      body: JSON.stringify({ jobs }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};