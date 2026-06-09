// functions/approve-user.js
exports.handler = async (event) => {
  // Autoriser uniquement les requêtes POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    const { userId } = JSON.parse(event.body);
    if (!userId) {
      return { statusCode: 400, body: 'userId manquant' };
    }

    // Exemple avec FaunaDB – remplacez par votre propre logique de base de données
    const faunadb = require('faunadb');
    const q = faunadb.query;
    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

    await client.query(
      q.Update(q.Ref(q.Collection('users'), userId), {
        data: { status: 'approved' }
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Utilisateur approuvé avec succès' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};