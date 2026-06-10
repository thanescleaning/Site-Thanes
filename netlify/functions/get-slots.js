const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const store = getStore('slots-db');
    const raw = await store.get('slots');
    const slots = raw ? JSON.parse(raw) : [];
    return {
      statusCode: 200,
      body: JSON.stringify({ slots }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};