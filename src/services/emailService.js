import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'localhost',
  port: process.env.MAIL_PORT || 1025,
  secure: false,
  ignoreTLS: true
});

export async function envoyerEmailBienvenue(destinataire, prenom, nom) {
  try {
    await transporter.sendMail({
      from: '"Vite et Gourmand" <contact@viteetgourmand.fr>',
      to: destinataire,
      subject: 'Bienvenue chez Vite et Gourmand !',
      html: `
        <div style="font-family: Georgia, serif; max-width: 500px; margin: auto;">
          <h2 style="color: #243029;">Bienvenue, ${prenom} ${nom} !</h2>
          <p>Votre compte a été créé avec succès chez <strong>Vite et Gourmand</strong>.</p>
          <p>Vous pouvez dès maintenant parcourir notre carte, nos menus et passer commande.</p>
          <p style="margin-top: 30px; color: #8f3d35; font-weight: bold;">À très vite !</p>
          <p style="font-size: 12px; color: #999;">L'équipe Vite et Gourmand</p>
        </div>
      `
    });
    console.log(`Email de bienvenue envoyé à ${destinataire} (consultable sur http://localhost:8025)`);
  } catch (error) {
    
    console.error("Échec envoi email de bienvenue (inscription non bloquée) :", error.message);
  }
}
