const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const slotsStore = getStore('slots-db');
    const rawSlots = await slotsStore.get('slots');
    const slots = rawSlots ? JSON.parse(rawSlots) : [];
    const appointmentsStore = getStore('appointments-db');
    const rawApps = await appointmentsStore.get('appointments');
    const appointments = rawApps ? JSON.parse(rawApps) : [];
    const now = new Date();
    const available = slots.filter(slot => {
      const slotDateTime = new Date(slot.date + 'T' + slot.start);
      if (slotDateTime <= now) return false;
      const taken = appointments.filter(a => a.slotId === slot.id).length;
      return taken < slot.maxPlaces;
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ slots: available }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};