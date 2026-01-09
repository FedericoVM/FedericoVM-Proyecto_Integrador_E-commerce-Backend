const express = require("express");
const autMiddleware = require("../middleware/authenticated");
const PagoController = require("../controllers/pagoController");
const router = express.Router();

router.post("/crear-carrito-payment-order", autMiddleware.autorizado, PagoController.comprobarCarritoActualizado)
router.post("/crear-producto-payment-order",autMiddleware.autorizado, PagoController.verificarProductoDisponible);
router.post("/finalizar-compra-producto", autMiddleware.autorizado, PagoController.comprarProducto)
router.post("/finalizar-compra-carrito", autMiddleware.autorizado, PagoController.finalizarPagoCarrito)
router.post("/payment-confirm", PagoController.confirmPayment);
router.get("/payment-history/:email", autMiddleware.autorizado, PagoController.historialDePago)

module.exports = router;
