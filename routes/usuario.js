const express = require("express");
const AuthControllers = require("../controllers/authControllers");
const router = express.Router();
const multiparty = require("connect-multiparty");
const autMiddleware = require("../middleware/authenticated");
const multipartyMiddleware = multiparty();

router.post("/registro",multipartyMiddleware, AuthControllers.registro);
router.post("/login",AuthControllers.login);
router.post("/recuperar-contrasenia",AuthControllers.recuperarContrasenia);
router.put("/",autMiddleware.autorizado,AuthControllers.cambiarContrasenia);
router.put("/cambiar-contrasenia/:token", AuthControllers.cambiarContraseniaDesdeEmail)
router.put("/:id",autMiddleware.autorizado,multipartyMiddleware,AuthControllers.editarUsuario);
router.get("/:id/verify/:token",AuthControllers.activarCuenta)
router.post("/reenviar-token", AuthControllers.reenviarToken)
router.get("/:info",autMiddleware.autorizado, AuthControllers.mostrarUsuario)
router.delete("/logout", autMiddleware.autorizado, AuthControllers.logout)

module.exports = router