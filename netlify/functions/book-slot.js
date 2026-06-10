const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { slotId, employeeEmail, employeeName } = JSON.parse(event.body);
    const slotsStore = getStore('slots-db');
    const rawSlots = await slotsStore.get('slots');
    const slots = rawSlots ? JSON.parse(rawSlots) : [];
    const slot = slots.find(s => s.id === slotId);
    if (!slot) return { statusCode: 404, body: 'Slot not found' };
    const appointmentsStore = getStore('appointments-db');
    const rawApps = await appointmentsStore.get('appointments');
    let appointments = rawApps ? JSON.parse(rawApps) : [];
    const taken = appointments.filter(a => a.slotId === slotId).length;
    if (taken >= slot.maxPlaces) {
      return { statusCode: 400, body: 'Slot complet' };
    }
    if (appointments.some(a => a.slotId === slotId && a.employeeEmail === employeeEmail)) {
      return { statusCode: 400, body: 'Déjà réservé' };
    }
    appointments.push({
      id: 'app_' + Date.now(),
      slotId,
      employeeEmail,
      employeeName,
      slotDate: slot.date,
      slotStart: slot.start,
      slotType: slot.type,
      bookedAt: new Date().toISOString(),
    });
    await appointmentsStore.set('appointments', JSON.stringify(appointments));
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