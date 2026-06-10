const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { appointmentId, employeeEmail } = JSON.parse(event.body);
    const appointmentsStore = getStore('appointments-db');
    const raw = await appointmentsStore.get('appointments');
    let appointments = raw ? JSON.parse(raw) : [];
    const appIndex = appointments.findIndex(a => a.id === appointmentId && a.employeeEmail === employeeEmail);
    if (appIndex === -1) return { statusCode: 404, body: 'Rendez-vous non trouvé' };
    appointments.splice(appIndex, 1);
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