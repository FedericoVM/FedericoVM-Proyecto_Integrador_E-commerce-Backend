const nodemailer = require("nodemailer")
const sendEmail = async(email, remitente, text) => {
    try {

        const transport = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: true, 
            service:"gmail",
            auth: {
                user: process.env.USUARIO_GMAIL, 
                pass: process.env.USUARIO_GMAIL_PASS,
            },
        });

        await transport.sendMail({
            from: remitente,
            to:email,
            html:text
        })
    } catch (error) {
        res.status(500).send({ mensaje: "Erro en el servidor."});
    }
}

module.exports = {sendEmail};