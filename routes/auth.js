const express = require("express");
const AuthControllers = require("../controllers/authControllers");
const router = express.Router();
const multiparty = require("connect-multiparty");
const autMiddleware = require("../middleware/authenticated");
const multipartyMiddleware = multiparty({uploadDir:"./uploads/avatar"});

router.post("/registro",multipartyMiddleware, AuthControllers.registro);
router.post("/login", AuthControllers.login);
router.get("/usuarios", autMiddleware.autorizado, autMiddleware.esAdmin ,AuthControllers.mostrarUsuarios)
router.put("/editar/:id",autMiddleware.autorizado,autMiddleware.esAdmin,multipartyMiddleware,AuthControllers.editarUsuario);
router.post("/recuperar-contrasenia",AuthControllers.recuperarContrasenia);
router.get("/:id/verify/:token",AuthControllers.activarCuenta)
router.delete("/delete/:id", autMiddleware.autorizado, autMiddleware.esAdmin , AuthControllers.borrarUsuario )




module.exports = router