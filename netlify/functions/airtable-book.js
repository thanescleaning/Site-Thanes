const axios = require('axios');

exports.handler = async (event) => {
  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  if (!token || !baseId) return { statusCode: 500, body: 'Missing env' };
  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const appointmentsTable = 'appointments';
  const slotsTable = 'slots';

  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      console.log('📥 Réservation reçue:', body);
      const { slotId, employeeEmail, employeeName } = body;

      // Récupérer le créneau
      const slotUrl = `https://api.airtable.com/v0/${baseId}/${slotsTable}/${slotId}`;
      const slotResp = await axios.get(slotUrl, { headers });
      const slot = slotResp.data.fields;
      console.log('📋 Créneau trouvé:', slot);

      // Vérifier les places
      const appsUrl = `https://api.airtable.com/v0/${baseId}/${appointmentsTable}?filterByFormula={slotId}="${slotId}"`;
      const appsResp = await axios.get(appsUrl, { headers });
      const taken = appsResp.data.records.length;
      if (taken >= slot.maxPlaces) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Slot complet' }) };
      }

      // Vérifier doublon
      const userApps = appsResp.data.records.filter(r => r.fields.employeeEmail === employeeEmail);
      if (userApps.length > 0) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Déjà réservé' }) };
      }

      // Créer la réservation (sans id personnalisé)
      const fields = {
        slotId,
        employeeEmail,
        employeeName,
        slotDate: slot.date,
        slotStart: slot.start,
        slotType: slot.type,
        bookedAt: new Date().toISOString()
      };
      console.log('📤 Envoi à Airtable (appointments):', fields);
      const postResp = await axios.post(`https://api.airtable.com/v0/${baseId}/${appointmentsTable}`, { fields }, { headers });
      console.log('✅ Réservation créée:', postResp.data);

      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      console.error('❌ Erreur Airtable:', err.response?.data || err.message);
      return { statusCode: 500, body: JSON.stringify({ error: err.response?.data?.error?.message || err.message }) };
    }
  }

  if (event.httpMethod === 'DELETE') {
    try {
      const { appointmentId, employeeEmail, adminEmail } = JSON.parse(event.body);
      const appUrl = `https://api.airtable.com/v0/${baseId}/${appointmentsTable}/${appointmentId}`;
      const app = await axios.get(appUrl, { headers });
      const isOwner = app.data.fields.employeeEmail === employeeEmail;
      const isAdmin = (adminEmail === 'thanescleaning@gmail.com');
      if (!isOwner && !isAdmin) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Non autorisé' }) };
      }
      await axios.delete(appUrl, { headers });
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    } catch (err) {
      console.error(err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: 'Method Not Allowed' };
};