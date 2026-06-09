// functions/get-users.js
exports.handler = async (event) => {
  // Autoriser uniquement les requêtes GET
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    // Exemple avec FaunaDB – obtenir tous les utilisateurs avec status 'pending'
    const faunadb = require('faunadb');
    const q = faunadb.query;
    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

    const result = await client.query(
      q.Map(
        q.Paginate(q.Match(q.Index('users_by_status'), 'pending')),
        q.Lambda('ref', q.Get(q.Var('ref')))
      )
    );

    const users = result.data.map(item => ({
      id: item.ref.id,
      ...item.data
    }));

    return {
      statusCode: 200,
      body: JSON.stringify({ users })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};