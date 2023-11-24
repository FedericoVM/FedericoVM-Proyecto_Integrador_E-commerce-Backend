const express = require("express")
const CarritoControllers = require("../controllers/carritoControllers");
const autMiddleware = require("../middleware/authenticated");
const multiparty = require("connect-multiparty");
const router = express.Router()


router.get("/",autMiddleware.autorizado,CarritoControllers.traerProductos);
router.post("/agregarProducto",autMiddleware.autorizado,CarritoControllers.agregarProducto);
router.delete("/:id",autMiddleware.autorizado,CarritoControllers.eliminarProducto);
router.put("/:id",autMiddleware.autorizado,CarritoControllers.editarProducto );

module.exports = router