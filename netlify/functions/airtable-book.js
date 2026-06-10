const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const slotsTable = 'slots';
  const appointmentsTable = 'appointments';
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  try {
    const { slotId, employeeEmail, employeeName } = JSON.parse(event.body);
    // Récupérer le créneau
    const slotUrl = `https://api.airtable.com/v0/${baseId}/${slotsTable}/${slotId}`;
    const slotResp = await axios.get(slotUrl, { headers });
    const slot = slotResp.data.fields;
    // Vérifier les places restantes (via appointments)
    const appsUrl = `https://api.airtable.com/v0/${baseId}/${appointmentsTable}?filterByFormula={slotId}="${slotId}"`;
    const appsResp = await axios.get(appsUrl, { headers });
    const taken = appsResp.data.records.length;
    if (taken >= slot.maxPlaces) return { statusCode: 400, body: 'Slot complet' };
    // Vérifier que l'employé n'a pas déjà réservé ce créneau
    const userApps = appsResp.data.records.filter(r => r.fields.employeeEmail === employeeEmail);
    if (userApps.length > 0) return { statusCode: 400, body: 'Déjà réservé' };
    // Créer le rendez-vous
    const fields = {
      id: 'app_' + Date.now(),
      slotId,
      employeeEmail,
      employeeName,
      slotDate: slot.date,
      slotStart: slot.start,
      slotType: slot.type,
      bookedAt: new Date().toISOString()
    };
    const appUrl = `https://api.airtable.com/v0/${baseId}/${appointmentsTable}`;
    await axios.post(appUrl, { fields }, { headers });
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) { console.error(err); return { statusCode: 500, body: JSON.stringify({ error: err.message }) }; }
};