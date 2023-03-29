const express = require("express");
const ProductosController = require('../controllers/adminProductos');
const router = express.Router();
const AutMiddleware = require('../middleware/authenticated')
const multipart = require("connect-multiparty")
const multipartMiddleware = multipart({uploadDir:"./uploads/products/files-img"})

router.get('/',ProductosController.obtenerProductos);
router.post('/crear-producto', AutMiddleware.autorizado,AutMiddleware.esAdmin, multipartMiddleware,ProductosController.crearProducto);
router.put('/editar/:id', AutMiddleware.autorizado,AutMiddleware.esAdmin, multipartMiddleware, ProductosController.editarProducto);
router.delete('/eliminar-producto/:id', AutMiddleware.autorizado,AutMiddleware.esAdmin,ProductosController.eliminarProducto)

module.exports = router