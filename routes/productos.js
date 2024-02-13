const express = require("express");
const ProductosController = require('../controllers/adminProductos');
const router = express.Router();
const AutMiddleware = require('../middleware/authenticated')
const multipart = require("connect-multiparty")
const multipartMiddleware = multipart()

router.get('/',ProductosController.obtenerProductos);
router.post('/', AutMiddleware.autorizado,AutMiddleware.esAdmin, multipartMiddleware,ProductosController.crearProducto);
router.put('/:id', AutMiddleware.autorizado,AutMiddleware.esAdmin, multipartMiddleware, ProductosController.editarProducto);
router.delete('/:id', AutMiddleware.autorizado,AutMiddleware.esAdmin,ProductosController.eliminarProducto)

module.exports = router