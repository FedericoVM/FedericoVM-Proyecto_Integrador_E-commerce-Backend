const CarritoModel = require("../models/carrito");
const ProductosModel = require("../models/product");

const traerProductos = async (req, res) => {
  const { email } = req.body;

  try {
    const productosCarrito = await CarritoModel.find({ email_usuario: email });

    productosCarrito.length > 0
      ? res.status(200).send(productosCarrito)
      : res
          .status(200)
          .send({ mensaje: "No hay productos agregados al carrito" });
  } catch (error) {
    res
      .status(500)
      .send({ mensaje: "Ocurrio un error al mostrar los productos" });
  }
};

const agregarProducto = async (req, res) => {
  const { email_usuario, productos, cantidad } = req.body;

  const productoAgregar = new CarritoModel({
    email_usuario,
    productos,
    cantidad,
  });

  try {
    const usuarioEncontrado = await CarritoModel.find({
      email_usuario: email_usuario,
    });

    const producto = await ProductosModel.findById(productos);

    let productoEncontrado = usuarioEncontrado.some((usuario) => {
      return usuario.productos === productos;
    });

    if (productoEncontrado) {
      return res.status(200).send({ mensaje: "Ya existe el producto" });
    }

    if (!producto) {
      return res.status(400).send({ mensaje: "Producto eliminado" });
    }

    if (producto.stock <= 0) {
      return res.status(200).send({ mensaje: "No hay stock del producto" });
    }

    await productoAgregar.save();

    return res
      .status(200)
      .send({ mensaje: "Se agrego el producto al carrito" });
  } catch (error) {
    return res
      .status(500)
      .send({ mensaje: "Ocurrio un problema en el servidor" });
  }
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    await CarritoModel.findByIdAndDelete(id);
    return res
      .status(200)
      .send({ mensaje: "El producto se elimmino del carrito" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ mensaje: "Error al borrar el producto del carrito" });
  }
};

const editarProducto = async (req, res) => {
  let { id } = req.params;

  let nuevaCantidad = req.body;

  try {
    let buscarProducto = await CarritoModel.findById(id);
    let productoEncontrado = await ProductosModel.findById(
      buscarProducto.productos
    );

    if (
      productoEncontrado.stock === 0 ||
      productoEncontrado.stock < nuevaCantidad.cantidad
    ) {
      return res.status(200).send({ mensaje: "Sin stock o insuficiente " });
    }

    await CarritoModel.findByIdAndUpdate(id, nuevaCantidad);

    return res.status(200).send({ mensaje: "Se actualizo el  producto" });
  } catch (error) {
    return res.status(400).send({ mensaje: "No se pudo hacer ningun cambio" });
  }
};

module.exports = {
  traerProductos,
  agregarProducto,
  eliminarProducto,
  editarProducto,
};
