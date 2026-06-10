const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { slotId, adminEmail } = JSON.parse(event.body);
    if (adminEmail !== 'thanescleaning@gmail.com') {
      return { statusCode: 403, body: 'Unauthorized' };
    }
    const store = getStore('slots-db');
    const raw = await store.get('slots');
    let slots = raw ? JSON.parse(raw) : [];
    slots = slots.filter(s => s.id !== slotId);
    await store.set('slots', JSON.stringify(slots));
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