// functions/reject-user.js
exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Méthode non autorisée' };
  }

  try {
    const { userId } = JSON.parse(event.body);
    if (!userId) {
      return { statusCode: 400, body: 'userId manquant' };
    }

    // Option A : supprimer complètement le document utilisateur
    const faunadb = require('faunadb');
    const q = faunadb.query;
    const client = new faunadb.Client({ secret: process.env.FAUNADB_SECRET });

    await client.query(q.Delete(q.Ref(q.Collection('users'), userId)));

    // Option B (commentée) : marquer simplement comme 'rejected'
    // await client.query(
    //   q.Update(q.Ref(q.Collection('users'), userId), { data: { status: 'rejected' } })
    // );

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Utilisateur rejeté et supprimé' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};