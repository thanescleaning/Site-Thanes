const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }
  try {
    const { userId } = JSON.parse(event.body);
    if (!userId) return { statusCode: 400, body: 'userId manquant' };
    const store = getStore('users-db');
    const rawData = await store.get('users');
    const users = rawData ? JSON.parse(rawData) : {};
    if (!users[userId]) return { statusCode: 404, body: 'Utilisateur non trouvé' };
    users[userId].status = 'approved';
    await store.set('users', JSON.stringify(users));
    return { statusCode: 200, body: JSON.stringify({ message: 'Utilisateur approuvé' }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
