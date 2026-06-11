// netlify/functions/send-email.js
const axios = require('axios');

exports.handler = async (event) => {
  // Autoriser uniquement POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.error('RESEND_API_KEY manquante');
    return { statusCode: 500, body: JSON.stringify({ error: 'Configuration email manquante' }) };
  }

  try {
    const { nom, email, telephone, service, message, langue } = JSON.parse(event.body);

    // Construction du contenu de l'email
    const subject = `Nouvelle demande de devis - ${nom}`;
    const text = `
Nouvelle demande de devis :

Nom : ${nom}
Email : ${email}
Téléphone : ${telephone}
Service : ${service}
Message : ${message}
Langue du site : ${langue}
    `;

    const html = `
      <h2>Nouvelle demande de devis</h2>
      <p><strong>Nom :</strong> ${nom}</p>
      <p><strong>Email :</strong> ${email}</p>
      <p><strong>Téléphone :</strong> ${telephone}</p>
      <p><strong>Service :</strong> ${service}</p>
      <p><strong>Message :</strong><br>${message.replace(/\n/g, '<br>')}</p>
      <p><em>Langue du site : ${langue}</em></p>
    `;

    // Envoi via Resend
    const response = await axios.post('https://api.resend.com/emails', {
      from: 'Thanes Cleaning <eslin@thanescleaning.ca>', // ← utilise votre domaine validé
      to: ['thanescleaning@gmail.com'],
      subject: subject,
      text: text,
      html: html,
    }, {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('Email envoyé avec succès', response.data);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (err) {
    console.error('Erreur Resend :', err.response?.data || err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur lors de l\'envoi de l\'email' })
    };
  }
};