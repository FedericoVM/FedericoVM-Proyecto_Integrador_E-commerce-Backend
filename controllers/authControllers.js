const userModel = require("../models/user");
const tokenModel = require("../models/token")
const byCrypt = require("bcryptjs");
const jwt_util = require("../utils/jwt");
const cloudinary = require("../utils/cloudinary");
const crypto = require("crypto")
const imagen_url = require("../utils/image");
const nodemailer = require("../utils/nodemailer")




const registro = async (req, res) => {

    const { nombre, apellido, edad, email, password, avatar } = req.body

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
        role: "admin",
        avatar
    })



    const salt = byCrypt.genSaltSync(Number(process.env.SALT));
    const passwordHasheado = byCrypt.hashSync(password, salt);
    nuevoUsuario.password = passwordHasheado

    try {
        if (req.files.avatar && req.files.avatar.size != 0) {
            const rutaImagen = imagen_url.rutaImagen(req.files.avatar)
            const archivoImagen = await cloudinary.uploader.upload(rutaImagen)

            nuevoUsuario.avatar = archivoImagen.url
            nuevoUsuario.cloudinary_id = archivoImagen.public_id
        } else {
            const archivoImagen = await cloudinary.uploader.upload("https://www.shutterstock.com/image-vector/avatar-man-icon-profile-placeholder-600w-1229859850.jpg")
             
             nuevoUsuario.avatar = archivoImagen.url
             nuevoUsuario.cloudinary_id = archivoImagen.public_id

        }

    } catch (error) {
        console.log(error);
        return res.status(400).send({ mensaje: "Error a la hora de subir la imagen" })
    }


    try {
        const usuario = await nuevoUsuario.save()

        const token = await tokenModel({
            usuarioId: usuario._id,
            token: crypto.randomBytes(32).toString("hex"),
        })

        await token.save();

        const link = `${process.env.URI_API}/api/auth/${usuario._id}/verify/${token.token}`;
        await nodemailer.sendEmail(usuario.email, "rollingStore_support@gmail.com", link);

        return res.status(200).send({ msj: "El registro fue exitoso" })
    } catch (error) {

        if (error.code === 11000) {

            return res.status(404).send({ msj: "Ya se encuentra registrado un usuario con ese email" })
        }
        console.log(error);
        return res.status(500).send({ msj: "Ocurrio un error a la hora de registrarse" })
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

const editarUsuario = async (req, res) => {
    const { id } = req.params
    const nuevaInfo = req.body

    const usuarioDB = await userModel.findById(id)



    try {

        if (usuarioDB.cloudinary_id) {
            await cloudinary.uploader.destroy(usuarioDB)
        }

        if (req.files.avatar) {
            const rutaImagen = imagen_url.rutaImagen(req.files.avatar)
            const archivoImagen = await cloudinary.uploader.upload(rutaImagen)

            nuevaInfo.avatar = archivoImagen.url
            nuevaInfo.cloudinary_id = archivoImagen.public_id
        }


        await userModel.findByIdAndUpdate(id, nuevaInfo)
        console.log(nuevaInfo);
        res.status(200).send({ mensaje: "Los datos fueron actualizados" })
    } catch (error) {
        res.status(500).send({ mensaje: "Ocurrio un error a la hora actualizar la informacion " })
    }
}


module.exports = {
    registro,
    login,
    editarUsuario,
}