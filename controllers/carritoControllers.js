const CarritoModel = require("../models/carrito");
const ProductosModel = require("../models/product");
const AppError = require("../utils/errors");

const traerProductos = async (req, res) => {
  const { email } = req.user;
  let carritoAFront = []

  try {
    const productosCarrito = await CarritoModel.find({ email_usuario: email });

    if(productosCarrito.length === 0) return res.status(204).send({message: "Su carrito esta vacio."})

    const productosMapeadosDB = await Promise.all(productosCarrito.map((pro)=> ProductosModel.findById(pro.idProducto)))

    productosCarrito.forEach((producto) => {
      
        if (producto) {
          productosMapeadosDB.find((c) => {
            
            if (producto.idProducto == c._id) {
              let productoCarrito = {
                id: producto._id,
                imagen: c.imagen,
                nombre: c.nombre,
                destacado: c.destacado,
                descuento: c.descuento,
                precio: c.precio,
                stock: c.stock,
                cantidad: producto.cantidad,
                idProducto: c._id,
                marca: c.marca
              };
              carritoAFront.push(productoCarrito);
            }
          });
        } else {
          let productoCarrito = {
            id: producto._id,
            imagen: "No Disponible",
            nombre: "No Disponible",
            precio: "No Disponible",
            cantidad: 0,
            stock: "No Disponible",
            idProducto: producto._id
          };
          carritoAFront.push(productoCarrito);
        }
      })
      
    return res.status(200).send(carritoAFront)
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send({ mensaje: "Ocurrio un error al mostrar los productos" });
  }
};

const agregarProducto = async (req, res) => {
  const { idProducto } = req.body;
  const { email } = req.user;
  const productoAgregar = new CarritoModel({
    email_usuario: email,
    idProducto: idProducto,
    cantidad: 1,
  });

  try {
    const usuarioEncontrado = await CarritoModel.find({
      email_usuario: productoAgregar.email_usuario,
    });

    const producto = await ProductosModel.findById(idProducto);

    let productoEncontrado = usuarioEncontrado.some((usuario) => {
      return usuario.idProducto === idProducto;
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
      .send({ mensaje: "Se elimino el producto del carrito" });
  } catch (error) {
    return res
      .status(500)
      .send({ mensaje: "Error al borrar el producto del carrito" });
  }
};

const editarProducto = async (req, res, next) => {
  let { id } = req.params;

  let nuevaCantidad = req.body;

  try {
    let buscarProducto = await CarritoModel.findById(id);

    if (!buscarProducto)
      throw new AppError("No se encontro el producto en su carrito.", 404);

    let productoEncontrado = await ProductosModel.findById(
      buscarProducto.idProducto
    );

    if (productoEncontrado.stock === 0)
      throw new AppError("El producto no cuenta con stock.", 202);

    if (nuevaCantidad.operacion === "sumar") {
      if (productoEncontrado.stock < nuevaCantidad.cantidad)
        throw new AppError(
          "No puede exeder el la cantidad de stock del producto.",
          202
        );
    }

    await CarritoModel.findByIdAndUpdate(id, nuevaCantidad);

    return res.status(200).send({ mensaje: "Se actualizo el  producto" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  traerProductos,
  agregarProducto,
  eliminarProducto,
  editarProducto,
};
