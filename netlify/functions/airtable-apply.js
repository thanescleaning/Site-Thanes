const axios = require('axios');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const token = process.env.AIRTABLE_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const tableName = 'jobs';

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  try {
    const { jobId, employeeEmail, employeeName } = JSON.parse(event.body);

    // Récupérer le job
    const url = `https://api.airtable.com/v0/${baseId}/${tableName}/${jobId}`;
    const jobResponse = await axios.get(url, { headers });
    const job = jobResponse.data;
    let applicants = job.fields.applicants ? JSON.parse(job.fields.applicants) : [];

    // Vérifier doublon
    if (applicants.some(a => a.email === employeeEmail)) {
      return { statusCode: 400, body: 'Déjà postulé' };
    }

    // Vérifier capacité
    const acceptedCount = applicants.filter(a => a.status === 'accepted').length;
    if (acceptedCount >= job.fields.slots) {
      return { statusCode: 400, body: 'Job complet' };
    }

    // Ajouter candidature
    applicants.push({
      email: employeeEmail,
      name: employeeName,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    });

    // Mettre à jour
    await axios.patch(url, { fields: { applicants: JSON.stringify(applicants) } }, { headers });

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (error) {
    console.error(error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};