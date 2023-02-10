const express = require("express");
const AuthControllers = require("../controllers/authControllers")
const router = express.Router();
const multiparty = require("connect-multiparty")

const multipartyMiddleware = multiparty({uploadDir:"./uploads/avatar"})

router.post("/registro",multipartyMiddleware, AuthControllers.registro)
router.post("/login", AuthControllers.login)

module.exports = router