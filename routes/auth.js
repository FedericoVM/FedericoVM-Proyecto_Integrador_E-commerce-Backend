const express = require("express");
const AuthControllers = require("../controllers/authControllers")
const authMiddleware = require("../middleware/authenticated")
const router = express.Router();


router.post("/registro", AuthControllers.registro)
router.post("/login", AuthControllers.login)
router.get("/usuarios", authMiddleware.autorizado, authMiddleware.esAdmin ,AuthControllers.mostrarUsuarios)
module.exports = router