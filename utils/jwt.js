const jwt = require("jsonwebtoken");


const crearToken = (usuario) => {

    const expiracionToken = new Date();

    expiracionToken.setHours(expiracionToken.getHours() + 3)

    const payload = {
        id_usuario : usuario._id,
        iat : Date.now(),
        expiracion: expiracionToken.getTime(),
        role : usuario.role
    }

    return jwt.sign(payload,process.env.JWT_SECRET_KET)
}

const decode = (token) => {

    return jwt.verify(token,payload,process.env.JWT_SECRET_KET)

}

module.exports = {
    crearToken,
    decode
}