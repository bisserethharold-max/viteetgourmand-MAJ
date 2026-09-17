import nodemailer from 'nodemailer';

export const envoyerContact = async (req, res) => {
  const { titre, description, email } = req.body;

  if (!titre || !description || !email) {
    return res.status(400).json({ error: "Tous les champs sont obligatoires." });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
    });

    await transporter.sendMail({
      from: email,
      to: "contact@viteetgourmand.fr",
      subject: `Nouveau message : ${titre}`,
      text: description,
    });

    res.status(200).json({ message: "Votre message a bien été envoyé !" });
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'envoi du message." });
  }
};