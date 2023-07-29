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
        role: "usuario",
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
            nuevoUsuario.avatar = "www.shutterstock.com/image-vector/avatar-man-icon-profile-placeholder-600w-1229859850.jpg"
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
        });

        await token.save();

        const link = `${process.env.URI_API}/usuario/${usuario._id}/verify/${token.token}`;
        await nodemailer.sendEmail(
            usuario.email,
            "support@gmail.com",
            link
        )
        console.log(nuevoUsuario);
        return res.status(200).send({ msj: "El registro fue exitoso. Se envio un email al correo para activar la cuenta" });
    } catch (error) {
        if (error.code === 11000) {
            return res
                .status(500)
                .send({ msj: "Ya se encuentra registrado un usuario con ese email" });
        }

        return res
            .status(500)
            .send({ msj: "Ocurrio un error a la hora de registrarse" });
    }

    
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).send({ mensaje: "Debe ingresar el email y password" });
    }

    const emailLowerCase = email.toLowerCase();

    try {
        const usuarioEncontrado = await userModel.findOne({
            email: emailLowerCase,
        });

        if (usuarioEncontrado.active === true) {
            const isMatch = byCrypt.compareSync(password, usuarioEncontrado.password);

            if (isMatch) {
                return res
                    .status(200)
                    .send({ token: jwt_util.crearToken(usuarioEncontrado) });
                   
            } else {
                return res.status(400).send({ mensaje: "Email o contraseña incorrecta" });
            }
        } else {
            return res
                .status(400)
                .send({
                    mensaje: "Error! Revisar que el email ingresado sea el correcto o bien que su cuenta este activada",
                });
        }
    } catch (error) {
        console.log(error);
        return res
            .status(500)
            .send({ mensaje: "Ocurrio un error a la hora de buscar el usuario" });
    }


};

const mostrarUsuario = async (req, res) => {
    
    const { id_usuario : id } = req.user
    

    try {
        const usuario = await userModel.findById(id)
        if (!usuario) {
           return res.status(404).send({ mensaje: "El usuario no fue encontrado" })
        }
       return res.status(200).send({ usuario })
    } catch (error) {
       return res.status(500).send({ mensaje:"Ocurrio un error en el proceso de buscar el usuario" })
    }
}

const mostrarUsuarios = async (req, res) => {

    const usuarios = await userModel.find();

    try {
        if (usuarios.length === 0) {
            return res.status(200).send({ mensaje: "No hay usuarios para mostrar" })
        } else {
            return res.status(200).send(usuarios)
        }

    } catch (error) {
        console.log(error);
        return res.status(500).send({ mensaje: "Se produjo un error a la hora de traer a los usuarios" })
    }
}

const editarUsuario = async (req, res) => {
    const { id } = req.params;
    const nuevaInfo = req.body;

    const usuarioDB = await userModel.findById(id);
 
    try {
   

        if (req.files.avatar!== undefined && (req.files.avatar.type == 'image/jpg' || req.files.avatar.type == 'image/jpeg')) {
            await cloudinary.uploader.destroy(usuarioDB.cloudinary_id);
            const rutaImagen = imagen_url.rutaImagen(req.files.avatar);
            const archivoImagen = await cloudinary.uploader.upload(rutaImagen);

            nuevaInfo.avatar = archivoImagen.url;
            nuevaInfo.cloudinary_id = archivoImagen.public_id;
        } else {
            nuevaInfo.avatar = usuarioDB.avatar
        }
        await userModel.findByIdAndUpdate(id,nuevaInfo);
        const usuario = await userModel.findById(id);
        return res.status(200).send({ token: jwt_util.crearToken(usuario) });
    } catch (error) {
        return res
            .status(400)
            .send({
                mensaje: "Ocurrio un error a la hora actualizar la informacion ",
            });
    }

    
}

const recuperarContrasenia = async (req, res) => {
    const { email } = req.body;

    try {
        const usuario = await userModel.findOne({ email });
        if (!usuario) {
            return res
                .status(404)
                .send({
                    mensaje: "No existe un usuario registrado con el email ingresado",
                });
        }

        const token = await tokenModel({
            usuarioId: usuario._id,
            token: crypto.randomBytes(32).toString("hex"),
        });

        await token.save();

        const link = `<a href="www.dominiofrontend.com/recuperacion-contrasenia/${token.token}">  Recuperar Contraseña </a>`;

        await nodemailer.sendEmail(email, "support@gmail.com", link);

        res.status(200).send({ mensaje: "Revisa tu correo para terminar el proceso" });

    } catch (error) {
        console.log(error);
        return res.status(500).send({ mensaje: "Error en el proceso de recuperacion de contraseña" })
    }
};

const cambiarContrasenia = async (req, res) => {

    const { password: nuevoPassword } = req.body
    if (!req.headers.authorization) {
        res.status(404).send({ msj: "Falta el headers token " })
    }

    try {

        const headerToken = req.headers.authorization.replace("Bearer ", "")
        const token = await tokenModel.findOne({ token: headerToken })
        console.log(headerToken);
        if (!token) {
            return res.status(400).send({ mensaje: "Error en el token" })
        }

        const usuario = await userModel.findById(token.usuarioId);

        if (!usuario) {
            return res.status(400).send({ msj: "Error en el token" })
        }

        if (usuario.password === nuevoPassword) {
            return res.status(400).send({ msj: "No se puede repetir la contraseña" })
        }

        const salt = byCrypt.genSaltSync(Number(process.env.SALT));
        const passwordHash = byCrypt.hashSync(nuevoPassword, salt);

        await userModel.findByIdAndUpdate({ _id: usuario._id }, { password: passwordHash })
        return res.status(200).send({ msj: "Su contraseña fue actualizada" })

    } catch (error) {
        return res.status(500).send({ msj: "Error a la hora de actualizar la contraseña" })
    }
};

const activarCuenta = async (req, res) => {
    const { id, token } = req.params

    try {
        const usuario = await userModel.findOne({ _id: id });
        if (usuario === null) {
            return res.status(404).send({ mensaje: "Error con el link ingresado" })
        }

        const verificacionToken = await tokenModel.findOne({
            usuarioId: usuario._id,
            token: token
        })


        if (verificacionToken === null) {
            return res.status(404).send({ mensaje: "Ocurrio un error. No se encontro el usuario, si copio el link, asegúrese de que esté completo" })
        }

        verificacionToken.remove();

    } catch (error) {
        return res.status(500).send({ mensaje: "Error a la hora de verificar el token" })
    }

    try {
        await userModel.findByIdAndUpdate({ _id: id }, { active: true });
        return res.status(200).send({ mensaje: "Felicidades! Tu cuenta ya se encuentra activada" })
    } catch (error) {
        console.log(error);
        return res.status(500).send({ mensaje: "Error! Fallo la activacion de tu cuenta " })
    }

};

const borrarUsuario = async (req, res) => {

    const { id } = req.params

    try {
        await userModel.findByIdAndDelete(id)
        res.status(200).send({ mensaje: "El usuario fue eliminado" })
    } catch (error) {
        console.log(error);
        res.status(400).send({ mensaje: "Ocurrio un error al intentar borrar el usuario" })
    }

}



module.exports = {
    registro,
    login,
    mostrarUsuario,
    mostrarUsuarios,
    editarUsuario,
    recuperarContrasenia,
    cambiarContrasenia,
    activarCuenta,
    borrarUsuario
};

