const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }
  try {
    const store = getStore('users-db');
    const rawData = await store.get('users');
    const users = rawData ? JSON.parse(rawData) : {};
    const usersList = Object.entries(users).map(([id, data]) => ({ id, ...data }));
    return { statusCode: 200, body: JSON.stringify({ users: usersList }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
