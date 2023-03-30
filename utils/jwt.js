const jwt = require("jsonwebtoken");


const crearToken = (usuario) => {

    const expiracionToken = new Date();

    expiracionToken.setHours(expiracionToken.getHours() + 3)

    const payload = {
        id_usuario : usuario._id,
        iat : Date.now(),
        nombre: usuario.nombre,
        imagen: usuario.avatar,
        role : usuario.role,
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