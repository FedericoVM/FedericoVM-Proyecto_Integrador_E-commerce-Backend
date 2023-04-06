const express = require("express");
const AuthControllers = require("../controllers/authControllers");
const router = express.Router();
const multiparty = require("connect-multiparty");
const autMiddleware = require("../middleware/authenticated");
const multipartyMiddleware = multiparty({uploadDir:"./uploads/avatar"});

router.post("/registro",multipartyMiddleware, AuthControllers.registro);
router.post("/login",AuthControllers.login);
router.post("/recuperar-contrasenia",AuthControllers.recuperarContrasenia);
router.get("/:id/verify/:token",AuthControllers.activarCuenta)




module.exports = router