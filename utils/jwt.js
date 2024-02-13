const jwt = require("jsonwebtoken");

const crearToken = (usuario) => {

    const expiracionToken = new Date();

    expiracionToken.setHours(expiracionToken.getHours() + 3)

    const payload = {
        id_usuario : usuario._id,
        iat : Date.now(),
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        imagen: usuario.avatar,
        email:usuario.email,
        role : usuario.role,
        edad: usuario.edad,
        expiracion: expiracionToken.getTime()
    }
    return jwt.sign(payload,process.env.JWT_SECRET_KET)
}

const decode = (token) => {
    return jwt.verify(token,process.env.JWT_SECRET_KET)
}

module.exports = {
    crearToken,
    decode
}