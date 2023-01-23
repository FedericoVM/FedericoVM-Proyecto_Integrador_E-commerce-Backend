const userModel = require("../models/user");
const byCrypt = require("bcryptjs")





const registro = async (req, res) => {

    const { nombre, apellido, edad, email, password } = req.body

    if (!email) {
        res.status(400).send({mensaje:"Debe ingresar un email"})
    }

    if (!password) {
        res.status(400).send({mensaje:"Debe ingresar un password"})
    }

    const nuevoUsuario = new userModel({
        nombre,
        apellido,
        edad,
        email: email.toLowerCase(),
        role: "Usuario"
    })

    
    const salt = byCrypt.genSaltSync( Number (process.env.SALT));
    const passwordHasheado = byCrypt.hashSync(password,salt);
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


module.exports = {
    registro
}