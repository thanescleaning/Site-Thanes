const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { jobId, applicantEmail, status, adminEmail } = JSON.parse(event.body);
    if (adminEmail !== 'thanescleaning@gmail.com') {
      return { statusCode: 403, body: 'Non autorisé' };
    }
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    let jobs = raw ? JSON.parse(raw) : [];
    const jobIndex = jobs.findIndex(j => j.id === jobId);
    if (jobIndex === -1) return { statusCode: 404, body: 'Job not found' };
    const job = jobs[jobIndex];
    const applicant = (job.applicants || []).find(a => a.email === applicantEmail);
    if (!applicant) return { statusCode: 404, body: 'Candidat non trouvé' };
    applicant.status = status;
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