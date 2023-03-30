const express = require("express");
const ProductosController = require('../controllers/adminProductos');
const router = express.Router();
const multipart = require("connect-multiparty")
const multipartMiddleware = multipart({uploadDir:"./uploads/products/files-img"})

router.get('/',ProductosController.obtenerProductos);
router.post('/',multipartMiddleware , ProductosController.crearProducto);
router.put('/:id', ProductosController.editarProducto);
router.delete('/:id', ProductosController.eliminarProducto)

module.exports = router