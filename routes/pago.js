const express = require("express");
const autMiddleware = require("../middleware/authenticated");
const PagoController = require("../controllers/pagoController");
const router = express.Router();

router.post("/paymentCarrito",autMiddleware.autorizado, PagoController.paymentCarrito);
router.post("/payment",autMiddleware.autorizado, PagoController.payment);
router.post("/payment-confirm", PagoController.confirmPayment);

module.exports = router;
