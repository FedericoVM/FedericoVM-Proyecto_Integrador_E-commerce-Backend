
const nodemailer = require("nodemailer")

/**
 * email -> Donde se enviara
 * remitente
 * texto que se desea enviar
 */
const sendEmail = async(email, remitente, text) => {
    try {
        // Config simple traida desde la pagina de nodemailer
        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: true, // upgrade later with STARTTLS
            service:"gmail",
            auth: {
                user: process.env.USUARIO_GMAIL, // Uusario del gmail con elque cree la contraseña
                pass: process.env.USUARIO_GMAIL_PASS, // Contraseña de aplicaciones generada por google. Esto es privado
            },
        });

        await transport.sendMail({
            from: remitente,
            to:email,
            html:text
        })

        console.log("Email enviado");
    } catch (error) {
        console.log(error);
        console.log("No se pudo enviar el email");
    }
}


module.exports = {sendEmail};