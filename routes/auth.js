const express = require("express");
const AuthControllers = require("../controllers/authControllers");
const router = express.Router();
const multiparty = require("connect-multiparty");
const autMiddleware = require("../middleware/authenticated");
const multipartyMiddleware = multiparty({uploadDir:"./uploads/avatar"});

router.get("/", autMiddleware.autorizado, autMiddleware.esAdmin ,AuthControllers.mostrarUsuarios)
router.put("/:id",autMiddleware.autorizado,autMiddleware.esAdmin,multipartyMiddleware,AuthControllers.editarUsuario);
router.delete("/:id", autMiddleware.autorizado, autMiddleware.esAdmin , AuthControllers.borrarUsuario )

module.exports = router