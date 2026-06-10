const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { date, start, duration, maxPlaces, type, adminEmail } = JSON.parse(event.body);
    if (adminEmail !== 'thanescleaning@gmail.com') {
      return { statusCode: 403, body: 'Unauthorized' };
    }
    const store = getStore('slots-db');
    const raw = await store.get('slots');
    const slots = raw ? JSON.parse(raw) : [];
    const newSlot = {
      id: 'slot_' + Date.now(),
      date,
      start,
      duration: parseInt(duration),
      maxPlaces: parseInt(maxPlaces),
      type,
      createdAt: new Date().toISOString(),
    };
    slots.push(newSlot);
    await store.set('slots', JSON.stringify(slots));
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, slot: newSlot }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};