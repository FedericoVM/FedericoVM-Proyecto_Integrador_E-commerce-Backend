const express = require("express");
const AuthControllers = require("../controllers/authControllers")
const router = express.Router();


router.post("/registro", AuthControllers.registro)
router.post("/login", AuthControllers.login)

module.exports = router