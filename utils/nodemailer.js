
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

        console.log("Email enviado");
    } catch (error) {
        console.log(error);
        console.log("No se pudo enviar el email");
    }
}


module.exports = {sendEmail};