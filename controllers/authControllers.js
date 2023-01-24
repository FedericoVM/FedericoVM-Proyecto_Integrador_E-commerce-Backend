const userModel = require("../models/user");
const byCrypt = require("bcryptjs")
const jwt_util = require("../utils/jwt")




const registro = async (req, res) => {

    const { nombre, apellido, edad, email, password } = req.body

    if (!email) {
        res.status(400).send({ mensaje: "Debe ingresar un email" })
    }

    if (!password) {
        res.status(400).send({ mensaje: "Debe ingresar un password" })
    }

    const nuevoUsuario = new userModel({
        nombre,
        apellido,
        edad,
        email: email.toLowerCase(),
        role: "Usuario"
    })


    const salt = byCrypt.genSaltSync(Number(process.env.SALT));
    const passwordHasheado = byCrypt.hashSync(password, salt);
    nuevoUsuario.password = passwordHasheado

    try {
        const usuario = await nuevoUsuario.save()
        res.status(200).send({ msj: "El registro fue exitoso" })
    } catch (error) {

        if (error.code === 11000) {

            res.status(500).send({ msj: "Ya se encuentra registrado un usuario con ese email" })
        }

        res.status(500).send({ msj: "Ocurrio un error a la hora de registrarse" })
    }


}

const login = async (req, res) => {

    const { email, password } = req.body

    if (!email || !password) {

        res.status(400).send({ mensaje: "Debe ingresar el email y password" })
    }

    const emailLowerCase = email.toLowerCase()

    try {
        const usuarioEncontrado = await userModel.findOne({ email: emailLowerCase })

        if (usuarioEncontrado) {
            const isMatch = byCrypt.compareSync(password, usuarioEncontrado.password)

            if (isMatch) {
                return res.status(200).send({ token: jwt_util.crearToken(usuarioEncontrado) })
            } else {
                return res.status(400).send({ mensaje: "Contraseña incorrecta" })
            }
        } else {
            return res.status(400).send({ mensaje: "Error! Revisar que el email ingresado sea el correcto" })
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ mensaje: "Ocurrio un error a la hora de buscar el usuario" })
    }
}

module.exports = {
    registro,
    login
}