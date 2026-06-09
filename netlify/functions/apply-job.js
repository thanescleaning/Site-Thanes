const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { jobId, employeeEmail, employeeName } = JSON.parse(event.body);
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    let jobs = raw ? JSON.parse(raw) : [];
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return { statusCode: 404, body: 'Job not found' };
    const job = jobs[jobIndex];
    // Vérifier capacité
    const acceptedCount = (job.applicants || []).filter(a => a.status === 'accepted').length;
    if (acceptedCount >= job.slots) {
      return { statusCode: 400, body: 'Job complet' };
    }
    if ((job.applicants || []).some(a => a.email === employeeEmail)) {
      return { statusCode: 400, body: 'Déjà postulé' };
    }
    if (!job.applicants) job.applicants = [];
    job.applicants.push({
      email: employeeEmail,
      name: employeeName,
      status: 'pending',
      appliedAt: new Date().toISOString(),
    });
    jobs[jobIndex] = job;
    await store.set('jobs', JSON.stringify(jobs));
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