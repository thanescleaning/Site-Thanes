const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { employeeEmail } = JSON.parse(event.body);
    const store = getStore('jobs-db');
    const raw = await store.get('jobs');
    const jobs = raw ? JSON.parse(raw) : [];
    const myApps = jobs.filter(job =>
      (job.applicants || []).some(a => a.email === employeeEmail)
    ).map(job => {
      const myApp = job.applicants.find(a => a.email === employeeEmail);
      return { ...job, myStatus: myApp.status };
    });
    return {
      statusCode: 200,
      body: JSON.stringify({ applications: myApps }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};