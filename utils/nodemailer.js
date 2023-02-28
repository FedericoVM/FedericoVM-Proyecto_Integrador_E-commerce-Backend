const nodemailer = require("nodemailer");

const enviarEmail = async (req, res) => {
  try {
    let transp = nodemailer.createTransport({
      host: "smtp.gmail.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      service: "gmail",
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    await transport.sendMail({
      from: remitente,
      to: email,
      html: text,
    });

    
    console.log("Email enviado");
    
  } catch (error) {
    console.log(error);
    console.log("No se pudo enviar el email");
  }
};
